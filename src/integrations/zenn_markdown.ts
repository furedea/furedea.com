interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  data?: {
    hName: string;
    hProperties: { className: string[] };
  };
}

export default function zennMarkdown() {
  return transformZennMessages;
}

export function transformZennMessages(value: unknown): void {
  if (!isMarkdownNode(value)) {
    return;
  }
  const node = value;
  if (node.children === undefined) {
    return;
  }
  node.children = node.children.map(toWebsiteMessage);
  node.children.forEach(transformZennMessages);
}

function toWebsiteMessage(node: MarkdownNode): MarkdownNode {
  if (node.type !== "paragraph" || node.children?.length !== 1) {
    return node;
  }
  const text = node.children[0];
  const match = /^:::message(?:\s+(alert))?\n([\s\S]*?)\n:::$/u.exec(text.value ?? "");
  if (text.type !== "text" || match === null) {
    return node;
  }
  const className = match[1] === "alert" ? "article-message-alert" : "article-message";
  return {
    type: "blockquote",
    data: {
      hName: "aside",
      hProperties: { className: [className] },
    },
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: match[2] }],
      },
    ],
  };
}

function isMarkdownNode(value: unknown): value is MarkdownNode {
  return (
    typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
  );
}
