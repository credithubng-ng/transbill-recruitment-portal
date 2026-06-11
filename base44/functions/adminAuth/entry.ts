import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

async function sha256(data) {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(username, secret) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `admin:${username}:${exp}`;
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyToken(token, secret) {
  if (!token) return { valid: false };
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return { valid: false };
  const payload = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);
  const parts = payload.split(':');
  const exp = parseInt(parts[2], 10);
  if (!exp || Date.now() > exp) return { valid: false };
  const expected = await hmac(payload, secret);
  if (sig !== expected) return { valid: false };
  return { valid: true, username: parts[1] };
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const masterPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!masterPassword) {
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);

    // Verify token action
    if (body.action === 'verify') {
      const result = await verifyToken(body.token, masterPassword);
      return Response.json(result);
    }

    // Create admin user action (requires valid token)
    if (body.action === 'create_admin') {
      const result = await verifyToken(body.token, masterPassword);
      if (!result.valid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { username, password, display_name } = body;
      if (!username || !password) return Response.json({ error: 'Username and password required' }, { status: 400 });

      // Check duplicate username
      const existing = await base44.asServiceRole.entities.AdminUser.filter({ username: username.trim().toLowerCase() });
      if (existing && existing.length > 0) {
        return Response.json({ error: 'Username already exists' }, { status: 409 });
      }

      const password_hash = await sha256(password);
      await base44.asServiceRole.entities.AdminUser.create({
        username: username.trim().toLowerCase(),
        password_hash,
        display_name: display_name || username,
        is_active: true,
      });
      return Response.json({ success: true });
    }

    // Update admin user (reset password / toggle active)
    if (body.action === 'update_admin') {
      const result = await verifyToken(body.token, masterPassword);
      if (!result.valid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const updates = {};
      if (body.password) updates.password_hash = await sha256(body.password);
      if (body.display_name !== undefined) updates.display_name = body.display_name;
      if (body.is_active !== undefined) updates.is_active = body.is_active;

      await base44.asServiceRole.entities.AdminUser.update(body.admin_id, updates);
      return Response.json({ success: true });
    }

    // Delete admin user
    if (body.action === 'delete_admin') {
      const result = await verifyToken(body.token, masterPassword);
      if (!result.valid) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      await base44.asServiceRole.entities.AdminUser.delete(body.admin_id);
      return Response.json({ success: true });
    }

    // List admin users
    if (body.action === 'list_admins') {
      const result = await verifyToken(body.token, masterPassword);
      if (!result.valid) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const admins = await base44.asServiceRole.entities.AdminUser.list();
      // Never return password hashes
      const safe = admins.map(({ password_hash, ...rest }) => rest);
      return Response.json({ admins: safe });
    }

    // Login action
    const { username, password } = body;

    if (!username || !password) {
      return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    const passwordHash = await sha256(password);
    const matches = await base44.asServiceRole.entities.AdminUser.filter({
      username: username.trim().toLowerCase(),
      password_hash: passwordHash,
      is_active: true,
    });

    if (!matches || matches.length === 0) {
      // Fallback: allow master password login with username "admin"
      if (username.trim().toLowerCase() === 'admin' && password === masterPassword) {
        const token = await createToken('admin', masterPassword);
        return Response.json({ success: true, token, display_name: 'Admin' });
      }
      return Response.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const adminUser = matches[0];
    // Update last login
    await base44.asServiceRole.entities.AdminUser.update(adminUser.id, {
      last_login_at: new Date().toISOString(),
    });

    const token = await createToken(adminUser.username, masterPassword);
    return Response.json({ success: true, token, display_name: adminUser.display_name || adminUser.username });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});