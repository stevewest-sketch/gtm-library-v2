import { NextResponse } from 'next/server';
import { db, tags, boardTags, assetTags } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET: Single tag by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

// PUT: Update a tag
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const [updatedTag] = await db
      .update(tags)
      .set({
        name: body.name,
        category: body.category,
        color: body.color,
      })
      .where(eq(tags.slug, slug))
      .returning();

    if (!updatedTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a tag
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First get the tag to get its ID
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Delete all board-tag associations
    await db
      .delete(boardTags)
      .where(eq(boardTags.tagId, tag.id));

    // Delete all asset-tag associations
    await db
      .delete(assetTags)
      .where(eq(assetTags.tagId, tag.id));

    // Delete the tag
    const [deletedTag] = await db
      .delete(tags)
      .where(eq(tags.slug, slug))
      .returning();

    return NextResponse.json({ success: true, deleted: deletedTag });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
