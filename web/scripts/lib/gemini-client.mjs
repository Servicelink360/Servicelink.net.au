const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_DELAY_MS = 4000;
const MAX_RETRIES = 5;
const MAX_RATE_LIMIT_RETRIES = 20;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function parseRetryAfterMs(errorMessage) {
  const match = errorMessage.match(/retry in ([\d.]+)s/i);
  if (match) {
    return Math.ceil(Number(match[1]) * 1000) + 2000;
  }
  return null;
}

function isRateLimitError(error) {
  return (
    error?.status === 429 ||
    error?.message?.includes("429") ||
    error?.message?.includes("RESOURCE_EXHAUSTED") ||
    error?.message?.includes("quota")
  );
}

/**
 * @param {string} prompt
 * @param {{ model?: string, temperature?: number }} [options]
 */
export async function generateJson(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required. Add it to web/.env");
  }

  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let lastError;
  let attempt = 0;
  let rateLimitAttempts = 0;

  while (attempt < MAX_RETRIES) {
    attempt += 1;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: options.temperature ?? 0.65,
          },
        }),
      });

      const body = await response.text();

      if (!response.ok) {
        const error = new Error(`Gemini API ${response.status}: ${body.slice(0, 500)}`);
        error.status = response.status;

        if (response.status === 429) {
          rateLimitAttempts += 1;
          if (rateLimitAttempts > MAX_RATE_LIMIT_RETRIES) {
            throw error;
          }

          const waitMs =
            parseRetryAfterMs(body) ??
            Number(process.env.GEMINI_RATE_LIMIT_WAIT_MS ?? 65000);
          console.log(
            `  Rate limited (${rateLimitAttempts}/${MAX_RATE_LIMIT_RETRIES}). Waiting ${Math.round(waitMs / 1000)}s…`,
          );
          await sleep(waitMs);
          attempt -= 1;
          continue;
        }

        throw error;
      }

      const payload = JSON.parse(body);
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Gemini returned no text content.");
      }

      return extractJson(text);
    } catch (error) {
      lastError = error;

      if (isRateLimitError(error) && rateLimitAttempts < MAX_RATE_LIMIT_RETRIES) {
        const waitMs =
          parseRetryAfterMs(error.message) ??
          Number(process.env.GEMINI_RATE_LIMIT_WAIT_MS ?? 65000);
        rateLimitAttempts += 1;
        console.log(
          `  Rate limited (${rateLimitAttempts}/${MAX_RATE_LIMIT_RETRIES}). Waiting ${Math.round(waitMs / 1000)}s…`,
        );
        await sleep(waitMs);
        attempt -= 1;
        continue;
      }

      if (attempt < MAX_RETRIES) {
        const backoff = attempt * 3000;
        console.log(`  Gemini attempt ${attempt} failed: ${error.message.slice(0, 120)}… Retrying in ${backoff}ms…`);
        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

export async function rateLimitDelay(ms = DEFAULT_DELAY_MS) {
  const delay = Number(process.env.GEMINI_DELAY_MS ?? ms);
  if (delay > 0) {
    await sleep(delay);
  }
}
