const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
  }
}

export class AiRequestError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
  }
}

/**
 * Sends a single-turn message to Claude and returns the raw text of the
 * first content block. Deliberately minimal (no SDK, no streaming, no tool
 * use) since this app only needs one structured JSON response per call —
 * see lead-ai-scoring.ts for the prompt and parsing.
 */
export async function completeWithClaude(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError();
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: params.maxTokens ?? 500,
        system: params.system,
        messages: [{ role: "user", content: params.prompt }],
      }),
    });
  } catch (err) {
    throw new AiRequestError(`Could not reach the Anthropic API: ${(err as Error).message}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AiRequestError(`Anthropic API returned ${response.status}: ${body}`, response.status);
  }

  const data = (await response.json()) as { content: { type: string; text?: string }[] };
  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock?.text) {
    throw new AiRequestError("Anthropic API response contained no text content");
  }

  return textBlock.text;
}
