import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

// Valid setting keys that can be stored
const VALID_KEYS = new Set([
  'meta_pixel_id',
  'instagram_access_token',
  'instagram_account_id',
  'instagram_url',
  'facebook_url',
  'whatsapp_number',
  'store_phone',
  'store_address',
  'google_analytics_id',
]);

/**
 * GET /api/settings
 * Returns all settings as a key-value object.
 * Public endpoint — no authentication required.
 */
export async function GET() {
  try {
    const settings = await db.setting.findMany();

    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Accepts { settings: { key: value, ... } } and upserts each key-value pair.
 * Requires admin authentication.
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin auth
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { settings: { key: value } }' },
        { status: 400 }
      );
    }

    // Filter to only valid keys
    const entries = Object.entries(settings).filter(
      ([key, value]) => VALID_KEYS.has(key) && typeof value === 'string'
    );

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    // Upsert each setting
    const upsertPromises = entries.map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(upsertPromises);

    // Return the updated settings
    const allSettings = await db.setting.findMany();
    const result: Record<string, string> = {};
    for (const setting of allSettings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
