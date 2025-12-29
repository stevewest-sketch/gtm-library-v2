import { NextRequest, NextResponse } from 'next/server';
import { db, contentTypes } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET all content types
export async function GET() {
  try {
    const types = await db.select().from(contentTypes).orderBy(contentTypes.sortOrder);
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching content types:', error);
    return NextResponse.json({ error: 'Failed to fetch content types' }, { status: 500 });
  }
}

// POST create new content type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, bgColor, textColor, sortOrder } = body;

    if (!name || !slug || !bgColor || !textColor) {
      return NextResponse.json(
        { error: 'name, slug, bgColor, and textColor are required' },
        { status: 400 }
      );
    }

    const [newType] = await db
      .insert(contentTypes)
      .values({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        hub: null, // All types are universal now
        bgColor,
        textColor,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('Error creating content type:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'A type with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create content type' }, { status: 500 });
  }
}

// PUT update content type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, bgColor, textColor, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(contentTypes)
      .set({
        name,
        slug: slug?.toLowerCase().replace(/\s+/g, '-'),
        hub: null, // All types are universal now
        bgColor,
        textColor,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(contentTypes.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating content type:', error);
    return NextResponse.json({ error: 'Failed to update content type' }, { status: 500 });
  }
}

// DELETE content type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(contentTypes)
      .where(eq(contentTypes.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content type:', error);
    return NextResponse.json({ error: 'Failed to delete content type' }, { status: 500 });
  }
}
