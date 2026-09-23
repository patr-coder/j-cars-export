// CMS page bodies are plain text with a tiny markup subset ("## " headings,
// "- " list items, blank-line paragraphs), rendered as React elements. No
// HTML is ever interpreted, so admin-entered content can't inject markup.
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseContentBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    if (list.length) blocks.push({ type: "list", items: list });
    paragraph = [];
    list = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith("##")) {
      flush();
      const heading = line.replace(/^#+/, "").trim();
      if (heading) blocks.push({ type: "heading", text: heading });
    } else if (line.startsWith("- ")) {
      if (paragraph.length) flush();
      list.push(line.slice(2).trim());
    } else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
