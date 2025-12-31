// Prompt templates for AI content generation

export const SYSTEM_PROMPT = `You are an expert content curator and technical writer for a Go-to-Market (GTM) resource library. Your job is to analyze content and generate structured, professional summaries and training materials.

You must always return valid JSON matching the requested schema. Be concise but informative. Use active voice and professional tone.`;

export interface GenerationConfig {
  hub: 'enablement' | 'content' | 'coe';
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
};

// Build the full prompt for content generation
export function buildGenerationPrompt(
  content: string,
  config: GenerationConfig
): string {
  const hubPrompt = HUB_PROMPTS[config.hub] || HUB_PROMPTS.content;

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
{
  "description": "...",
  "shortDescription": "...",
  "takeaways": ["...", "..."],
  "howtos": [{"title": "...", "content": "..."}],
  "tips": ["...", "..."],
  "suggestedTags": ["...", "..."],
  "suggestedType": "..."
}

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
