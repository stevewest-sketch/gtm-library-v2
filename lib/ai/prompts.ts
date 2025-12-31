// Prompt templates for AI content generation

export const SYSTEM_PROMPT = `You are an expert content curator and technical writer for a Go-to-Market (GTM) resource library. Your job is to analyze content and generate structured, professional summaries and training materials.

You must always return valid JSON matching the requested schema. Be concise but informative. Use active voice and professional tone.`;

export interface GenerationConfig {
  hub?: 'enablement' | 'content' | 'coe';
  format?: string;
  generateFields: string[];
  prompt?: string;
}

// Hub-specific generation instructions
export const HUB_PROMPTS: Record<string, string> = {
  enablement: `This is a training/enablement asset. Focus on:
- Clear, actionable takeaways that learners can immediately apply
- Step-by-step how-to instructions for key processes
- Practical tips and best practices
- Information about the training session (presenter, duration, date if available)

Generate content that helps sales reps and customer-facing teams learn and apply new skills.`,

  content: `This is a content/marketing asset. Focus on:
- Clear, compelling description that highlights value
- Key points and highlights from the content
- How this content can be used in customer conversations
- Any data, statistics, or proof points included

Generate content that helps users quickly understand and utilize this resource.`,

  coe: `This is a Center of Excellence (CoE) best practice or resource. Focus on:
- Structured process steps or methodology
- Best practices and proven approaches
- Tools, templates, or frameworks included
- How to apply this in real-world scenarios

Generate content that captures institutional knowledge and enables consistent execution.`,
};

// Field-specific generation prompts
export const FIELD_PROMPTS: Record<string, string> = {
  title: `Generate a clear, concise title (5-10 words) for this asset. The title should:
- Clearly describe what the content is about
- Be specific but not too long
- Use title case (capitalize major words)
- Be professional and informative
Example: "Discovery Call Best Practices for Enterprise Sales"`,

  hub: `Determine the most appropriate hub category for this content. Choose ONE of these exact values:
- "enablement" - Training content, how-to guides, skill development, recorded sessions, workshops, certifications
- "content" - Marketing materials, customer-facing content, collateral, presentations, data sheets
- "coe" - Center of Excellence best practices, process documentation, templates, playbooks, methodologies
Return ONLY the lowercase slug string (enablement, content, or coe).`,

  format: `Determine the content format. Choose the most appropriate from these options:
- "video" - Recorded video content, webinars, training recordings
- "slides" - Presentation slides (PowerPoint, Google Slides)
- "document" - Text documents, PDFs, guides
- "on-demand" - Self-paced learning content
- "live-replay" - Recorded live sessions
- "tool" - Interactive tools, calculators
- "template" - Reusable templates
- "guide" - How-to guides, manuals
- "battlecard" - Competitive battlecards
- "one-pager" - Single-page summaries
- "course" - Multi-part learning courses
- "link" - External web links
Return ONLY the lowercase slug string.`,

  description: `Generate a clear, professional description (2-4 sentences) that explains:
- What this asset is about
- Who it's for
- The key value or benefit`,

  shortDescription: `Generate a very brief summary in exactly 6 words or fewer. This appears on card previews.
Example: "Sales objection handling best practices"`,

  takeaways: `Generate 3-5 key takeaways as an array of strings. Each takeaway should:
- Start with an action verb
- Be specific and actionable
- Be one sentence each
Example: ["Learn to identify buying signals early", "Practice the SPIN questioning technique"]`,

  howtos: `Generate 3-6 how-to steps as an array of objects with "title" and "content" fields. Each step should:
- Have a clear, action-oriented title
- Include 2-3 sentences of detailed instructions in the content
Example: [{"title": "Prepare Your Discovery Questions", "content": "Before the call, review the prospect's company and prepare 5-7 open-ended questions..."}]`,

  tips: `Generate 3-5 practical tips as an array of strings. Each tip should:
- Be actionable and specific
- Provide a clear benefit
- Be based on the content provided
Example: ["Always confirm next steps before ending a call", "Use the customer's own words when summarizing"]`,

  tags: `Suggest 3-7 relevant tags as an array of lowercase, hyphenated slugs. Tags should:
- Be specific to the content topic
- Include product names, use cases, or themes
- Match existing taxonomy when possible
Example: ["discovery-calls", "objection-handling", "enterprise-sales"]`,

  suggestedType: `Suggest the most appropriate content type slug based on the content. Common types include:
- battlecard, template, guide, one-pager
- customer-example, customer-quote, customer-success-metric
- gtm-training, product-training, certification
- demo-video, product-overview, competitive
Return only the slug string.`,

  extractedLinks: `Analyze the content and extract/categorize any URLs found. Return an object with these fields:
- primaryLink: The main resource URL (landing page, article, or primary content location)
- videoUrl: Video content URL (YouTube, Vimeo, Loom, Wistia, embedded video, etc.)
- slidesUrl: Presentation slides URL (Google Slides, PowerPoint online, SlideShare, etc.)
- transcriptUrl: Transcript or text version URL
- relatedAssets: Array of additional related documents, templates, or resources with display names

Rules for categorization:
- If the input URL is a video platform (YouTube, Loom, etc.), set it as videoUrl AND primaryLink
- If the input URL is Google Slides, set it as slidesUrl AND primaryLink
- Look for embedded iframes and linked resources in the content
- Only include URLs that are actually present in the content
- Use null for categories where no URL was found
- For relatedAssets, include any PDFs, documents, templates, guides, or additional resources found
- Each related asset should have a descriptive displayName based on the link text or context

Example:
{
  "primaryLink": "https://example.com/training-page",
  "videoUrl": "https://www.youtube.com/watch?v=abc123",
  "slidesUrl": "https://docs.google.com/presentation/d/xyz",
  "transcriptUrl": null,
  "relatedAssets": [
    {"url": "https://example.com/download/guide.pdf", "displayName": "Training Guide"},
    {"url": "https://example.com/template.xlsx", "displayName": "ROI Calculator Template"}
  ]
}`,
};

// Build the full prompt for content generation
export function buildGenerationPrompt(
  content: string,
  config: GenerationConfig
): string {
  // If hub is not specified, we're inferring it - provide context for all hubs
  const hubPrompt = config.hub
    ? HUB_PROMPTS[config.hub] || HUB_PROMPTS.content
    : `Analyze the content to determine the appropriate hub category. Consider:
- "enablement" - Training content, how-to guides, skill development, recorded sessions
- "content" - Marketing materials, customer-facing content, collateral
- "coe" - Best practices, process documentation, templates, methodologies`;

  const fieldInstructions = config.generateFields
    .map(field => {
      const instruction = FIELD_PROMPTS[field];
      return instruction ? `\n### ${field}\n${instruction}` : '';
    })
    .filter(Boolean)
    .join('\n');

  const userGuidance = config.prompt
    ? `\n\n## Additional Guidance from User\n${config.prompt}`
    : '';

  // Build example JSON based on requested fields
  const exampleFields: Record<string, unknown> = {};
  if (config.generateFields.includes('title')) exampleFields.title = "Asset Title Here";
  if (config.generateFields.includes('hub')) exampleFields.suggestedHub = "enablement";
  if (config.generateFields.includes('format')) exampleFields.suggestedFormat = "video";
  if (config.generateFields.includes('description')) exampleFields.description = "...";
  if (config.generateFields.includes('shortDescription')) exampleFields.shortDescription = "...";
  if (config.generateFields.includes('takeaways')) exampleFields.takeaways = ["...", "..."];
  if (config.generateFields.includes('howtos')) exampleFields.howtos = [{"title": "...", "content": "..."}];
  if (config.generateFields.includes('tips')) exampleFields.tips = ["...", "..."];
  if (config.generateFields.includes('tags')) exampleFields.suggestedTags = ["...", "..."];
  if (config.generateFields.includes('suggestedType')) exampleFields.suggestedType = "...";
  if (config.generateFields.includes('extractedLinks')) exampleFields.extractedLinks = { primaryLink: "...", videoUrl: "...", slidesUrl: null, transcriptUrl: null, relatedAssets: [{ url: "...", displayName: "..." }] };

  return `## Content Type Context
${hubPrompt}

## Fields to Generate
${fieldInstructions}
${userGuidance}

## Source Content
Analyze the following content and generate the requested fields:

---
${content}
---

## Response Format
Return a JSON object with only the requested fields. Example structure:
${JSON.stringify(exampleFields, null, 2)}

Only include fields that were requested. Ensure all arrays and objects are properly formatted.`;
}

// Prompt for extracting links from content
export const LINK_EXTRACTION_PROMPT = `Analyze the content and extract any relevant links. Categorize them as:
- primaryLink: The main resource URL
- videoUrl: Video content (YouTube, Vimeo, Loom, etc.)
- slidesUrl: Presentation slides (Google Slides, PowerPoint, etc.)
- transcriptUrl: Transcript or text version
- keyAssetUrl: Key downloadable document

Return a JSON object with only the links you find. Use null for categories not found.`;

// Prompt for improving existing content
export function buildEnhancementPrompt(
  existingContent: Record<string, unknown>,
  newContext: string,
  fieldsToEnhance: string[]
): string {
  return `## Existing Asset Content
${JSON.stringify(existingContent, null, 2)}

## New Context/Information
${newContext}

## Task
Enhance or improve the following fields based on the new context provided:
${fieldsToEnhance.join(', ')}

Keep the existing style and tone. Only improve clarity, completeness, or accuracy based on the new information.

Return a JSON object with only the enhanced fields.`;
}
