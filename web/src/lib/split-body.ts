/** Split long CMS/Gemini body text into readable paragraphs. */
export function splitBodyParagraphs(body: string): string[] {
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .flatMap((block) => {
      const trimmed = block.trim();
      if (!trimmed) return [];
      // Long blocks sometimes use single newlines between paragraphs
      if (trimmed.includes("\n") && trimmed.length > 420) {
        return trimmed
          .split(/\n+/)
          .map((part) => part.trim())
          .filter(Boolean);
      }
      return [trimmed.replace(/\n+/g, " ")];
    });

  // If still one giant wall of text, break on sentence boundaries
  if (blocks.length === 1 && blocks[0].length > 520) {
    return splitLongParagraph(blocks[0]);
  }

  return blocks;
}

function splitLongParagraph(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length < 3) return [text];

  const paragraphs: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current}${sentence}`;
    if (current && next.length > 280) {
      paragraphs.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs.length > 1 ? paragraphs : [text];
}
