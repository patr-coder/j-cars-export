import { parseContentBlocks } from "@/lib/cms/blocks";

export function ContentBlocks({ body }: { body: string }) {
  const blocks = parseContentBlocks(body);
  return (
    <div className="flex flex-col gap-4 text-base leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="mt-4 text-xl font-semibold">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-6 text-muted-foreground">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-muted-foreground">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
