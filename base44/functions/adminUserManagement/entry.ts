import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, action } = body;

    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // LIST — any admin role can view
    if (action === 'list') {
      const users = await base44.asServiceRole.entities.AdminUser.list('email', 500);
      const auditLogs = await base44.asServiceRole.entities.AdminAuditLog.list('-performed_at', 50);
      return Response.json({ users, auditLogs });
    }

    // All remaining actions are owner-only
    if (admin.role !== 'owner') {
      return Response.json({ error: 'Owner access required to manage admin users.' }, { status: 403 });
    }

    if (action === 'add') {
      const { email, display_name, role } = body;
      const normEmail = normalizeEmail(email);
      if (!normEmail) return Response.json({ error: 'A valid email is required.' }, { status: 400 });
      if (!['owner', 'admin', 'read_only'].includes(role)) {
        return Response.json({ error: 'A valid role is required.' }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
      if (existing?.length > 0) {
        if (existing[0].active) {
          return Response.json({ error: 'This email is already an active admin user.' }, { status: 409 });
        }
        // Reactivate
        await base44.asServiceRole.entities.AdminUser.update(existing[0].id, {
          active: true, role, display_name: display_name || existing[0].display_name,
          approved_at: new Date().toISOString(), approved_by: admin.email,
        });
        await base44.asServiceRole.entities.AdminAuditLog.create({
          action: 'add', target_email: normEmail, target_role: role,
          performed_by: admin.email, performed_at: new Date().toISOString(),
          details: 'Re-activated existing admin user',
        });
        return Response.json({ success: true });
      }

      await base44.asServiceRole.entities.AdminUser.create({
        email: normEmail, display_name: display_name || normEmail.split('@')[0],
        role, active: true,
        approved_at: new Date().toISOString(), approved_by: admin.email,
      });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'add', target_email: normEmail, target_role: role,
        performed_by: admin.email, performed_at: new Date().toISOString(),
        details: 'Added new admin user',
      });
      return Response.json({ success: true });
    }

    if (action === 'deactivate') {
      const { email: targetEmail } = body;
      const normEmail = normalizeEmail(targetEmail);
      const matches = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
      const target = matches?.[0];
      if (!target) return Response.json({ error: 'Admin user not found.' }, { status: 404 });

      // Prevent self-lockout
      if (normEmail === admin.email) {
        return Response.json({ error: 'You cannot deactivate your own account.' }, { status: 400 });
      }

      // Prevent removing the last active owner
      if (target.role === 'owner' && target.active) {
        const activeOwners = await base44.asServiceRole.entities.AdminUser.filter({ role: 'owner', active: true });
        if (activeOwners.length <= 1) {
          return Response.json({ error: 'Cannot deactivate the last active owner.' }, { status: 400 });
        }
      }

      await base44.asServiceRole.entities.AdminUser.update(target.id, { active: false });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'deactivate', target_email: normEmail, target_role: target.role,
        performed_by: admin.email, performed_at: new Date().toISOString(),
        details: 'Deactivated admin user',
      });
      return Response.json({ success: true });
    }

    if (action === 'activate') {
      const { email: targetEmail } = body;
      const normEmail = normalizeEmail(targetEmail);
      const matches = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
      const target = matches?.[0];
      if (!target) return Response.json({ error: 'Admin user not found.' }, { status: 404 });

      await base44.asServiceRole.entities.AdminUser.update(target.id, {
        active: true, approved_at: new Date().toISOString(), approved_by: admin.email,
      });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'activate', target_email: normEmail, target_role: target.role,
        performed_by: admin.email, performed_at: new Date().toISOString(),
        details: 'Re-activated admin user',
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});