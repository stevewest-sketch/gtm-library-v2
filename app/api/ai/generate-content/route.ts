import { NextRequest, NextResponse } from 'next/server';
import { generateContent, GenerateContentRequest } from '@/lib/ai/content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { url, text, existingAsset, hub, generateFields, prompt, format } = body;

    if (!url && !text && !existingAsset) {
      return NextResponse.json(
        { error: 'At least one input source (url, text, or existingAsset) is required' },
        { status: 400 }
      );
    }

    if (!hub || !['enablement', 'content', 'coe'].includes(hub)) {
      return NextResponse.json(
        { error: 'hub is required and must be one of: enablement, content, coe' },
        { status: 400 }
      );
    }

    if (!generateFields || !Array.isArray(generateFields) || generateFields.length === 0) {
      return NextResponse.json(
        { error: 'generateFields array is required with at least one field' },
        { status: 400 }
      );
    }

    // Validate field names
    const validFields = ['description', 'shortDescription', 'takeaways', 'howtos', 'tips', 'tags', 'suggestedType'];
    const invalidFields = generateFields.filter((f: string) => !validFields.includes(f));
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}. Valid fields: ${validFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Build request
    const genRequest: GenerateContentRequest = {
      url,
      text,
      existingAsset,
      hub,
      format,
      generateFields,
      prompt,
    };

    // Generate content
    const result = await generateContent(genRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Content generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      crawledData: result.crawledData,
    });
  } catch (error) {
    console.error('AI generate-content error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
