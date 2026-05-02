// Simple in-memory token store for admin authentication
const tokens = new Map<string, { adminId: string; username: string }>();

export function createToken(adminId: string, username: string): string {
  const token = crypto.randomUUID();
  tokens.set(token, { adminId, username });
  return token;
}

export function verifyToken(token: string): { adminId: string; username: string } | null {
  return tokens.get(token) || null;
}

export function deleteToken(token: string): void {
  tokens.delete(token);
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
