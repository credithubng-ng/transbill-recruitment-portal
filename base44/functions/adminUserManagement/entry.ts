import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

const VALID_ROLES = ['owner', 'admin', 'read_only', 'digital_marketer'];
const MUTATION_ROLES = ['owner', 'admin', 'read_only']; // roles that can mutate applicant data

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

    // digital_marketer cannot access admin user management at all
    if (admin.role === 'digital_marketer') {
      return Response.json({ error: 'Access denied.' }, { status: 403 });
    }

    // LIST — owner, admin, read_only can view
    if (action === 'list') {
      const users = await base44.asServiceRole.entities.AdminUser.list('email', 500);
      // Never expose OTP hashes or secrets
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        display_name: u.display_name,
        role: u.role,
        active: u.active,
        approved_at: u.approved_at,
        approved_by: u.approved_by,
        last_login_at: u.last_login_at,
        notes: u.notes,
        created_date: u.created_date,
        updated_date: u.updated_date,
      }));
      const auditLogs = await base44.asServiceRole.entities.AdminAuditLog.list('-performed_at', 100);
      return Response.json({ users: safeUsers, auditLogs });
    }

    // All remaining actions are owner-only
    if (admin.role !== 'owner') {
      return Response.json({ error: 'Owner access required to manage admin users.' }, { status: 403 });
    }

    if (action === 'add') {
      const { email, display_name, role, notes } = body;
      const normEmail = normalizeEmail(email);
      if (!normEmail) return Response.json({ error: 'A valid email is required.' }, { status: 400 });
      const assignedRole = VALID_ROLES.includes(role) ? role : 'digital_marketer';

      const existing = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
      if (existing?.length > 0) {
        if (existing[0].active) {
          return Response.json({ error: 'This email is already an active admin user.' }, { status: 409 });
        }
        // Reactivate
        await base44.asServiceRole.entities.AdminUser.update(existing[0].id, {
          active: true, role: assignedRole, display_name: display_name || existing[0].display_name,
          approved_at: new Date().toISOString(), approved_by: admin.email,
          notes: notes ?? existing[0].notes,
        });
        await base44.asServiceRole.entities.AdminAuditLog.create({
          action: 'add', target_email: normEmail, target_role: assignedRole,
          old_status: 'inactive', new_status: 'active',
          performed_by: admin.email, performed_at: new Date().toISOString(),
          details: 'Re-activated existing admin user',
        });
        return Response.json({ success: true });
      }

      await base44.asServiceRole.entities.AdminUser.create({
        email: normEmail, display_name: display_name || normEmail.split('@')[0],
        role: assignedRole, active: true,
        approved_at: new Date().toISOString(), approved_by: admin.email,
        notes: notes || '',
      });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'add', target_email: normEmail, target_role: assignedRole,
        old_status: 'inactive', new_status: 'active',
        performed_by: admin.email, performed_at: new Date().toISOString(),
        details: 'Added new admin user',
      });
      return Response.json({ success: true });
    }

    if (action === 'edit') {
      const { email: targetEmail, role: newRole, notes } = body;
      const normEmail = normalizeEmail(targetEmail);
      const matches = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
      const target = matches?.[0];
      if (!target) return Response.json({ error: 'Admin user not found.' }, { status: 404 });

      // Prevent self-lockout: cannot change your own role away from owner
      if (normEmail === admin.email && target.role === 'owner' && newRole && newRole !== 'owner') {
        return Response.json({ error: 'You cannot remove your own owner role.' }, { status: 400 });
      }

      const assignedRole = VALID_ROLES.includes(newRole) ? newRole : target.role;

      // Prevent removing the last owner
      if (target.role === 'owner' && assignedRole !== 'owner' && target.active) {
        const activeOwners = await base44.asServiceRole.entities.AdminUser.filter({ role: 'owner', active: true });
        if (activeOwners.length <= 1) {
          return Response.json({ error: 'Cannot change the role of the last active owner.' }, { status: 400 });
        }
      }

      const oldRole = target.role;
      const updates: any = {};
      if (newRole && VALID_ROLES.includes(newRole)) updates.role = newRole;
      if (notes !== undefined) updates.notes = notes;

      if (Object.keys(updates).length === 0) {
        return Response.json({ error: 'No changes specified.' }, { status: 400 });
      }

      await base44.asServiceRole.entities.AdminUser.update(target.id, updates);
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: oldRole !== assignedRole ? 'role_change' : 'edit',
        target_email: normEmail,
        target_role: assignedRole,
        old_role: oldRole,
        new_role: assignedRole,
        performed_by: admin.email,
        performed_at: new Date().toISOString(),
        details: notes !== undefined ? `Updated notes/role` : 'Edited admin user',
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

      // Prevent removing the last owner
      if (target.role === 'owner' && target.active) {
        const activeOwners = await base44.asServiceRole.entities.AdminUser.filter({ role: 'owner', active: true });
        if (activeOwners.length <= 1) {
          return Response.json({ error: 'Cannot deactivate the last active owner.' }, { status: 400 });
        }
      }

      await base44.asServiceRole.entities.AdminUser.update(target.id, { active: false });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'deactivate', target_email: normEmail, target_role: target.role,
        old_status: 'active', new_status: 'inactive',
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
        old_status: 'inactive', new_status: 'active',
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