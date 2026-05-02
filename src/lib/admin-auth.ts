import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-admin-auth-12345';

export function createToken(adminId: string, username: string): string {
  const payload = Buffer.from(JSON.stringify({ adminId, username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): { adminId: string; username: string } | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null;

    return { adminId: decoded.adminId, username: decoded.username };
  } catch {
    return null;
  }
}

export function deleteToken(token: string): void {
  // Stateless tokens cannot be deleted server-side; client deletes the cookie.
}

/**
 * Extract and verify admin token from request cookies.
 * Returns admin info if valid, null otherwise.
 */
export function getAdminFromRequest(request: Request): { adminId: string; username: string } | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/);
  if (!tokenMatch) return null;
  
  const token = tokenMatch[1];
  return verifyToken(token);
}
