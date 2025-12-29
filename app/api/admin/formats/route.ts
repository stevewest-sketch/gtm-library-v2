import { NextRequest, NextResponse } from 'next/server';
import { db, formats } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET all formats
export async function GET() {
  try {
    const allFormats = await db.select().from(formats).orderBy(formats.sortOrder);
    return NextResponse.json(allFormats);
  } catch (error) {
    console.error('Error fetching formats:', error);
    return NextResponse.json({ error: 'Failed to fetch formats' }, { status: 500 });
  }
}

// POST create new format
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, color, iconType, sortOrder } = body;

    if (!name || !slug || !color) {
      return NextResponse.json(
        { error: 'name, slug, and color are required' },
        { status: 400 }
      );
    }

    const [newFormat] = await db
      .insert(formats)
      .values({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        color,
        iconType: iconType || 'document',
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json(newFormat, { status: 201 });
  } catch (error) {
    console.error('Error creating format:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'A format with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create format' }, { status: 500 });
  }
}

// PUT update format
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, color, iconType, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(formats)
      .set({
        name,
        slug: slug?.toLowerCase().replace(/\s+/g, '-'),
        color,
        iconType,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(formats.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Format not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating format:', error);
    return NextResponse.json({ error: 'Failed to update format' }, { status: 500 });
  }
}

// DELETE format
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(formats)
      .where(eq(formats.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Format not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting format:', error);
    return NextResponse.json({ error: 'Failed to delete format' }, { status: 500 });
  }
}
