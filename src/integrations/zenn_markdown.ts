interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  data?: {
    hName: string;
    hProperties: Record<string, unknown>;
  };
}

export default function zennMarkdown() {
  return transformZennExtensions;
}

export function transformZennExtensions(value: unknown): void {
  if (!isMarkdownNode(value)) {
    return;
  }
  const node = value;
  if (node.children === undefined) {
    return;
  }
  if (node.data?.hName === "figure") {
    return;
  }
  const messages = transformMessageBlocks(node.children);
  node.children = transformCaptions(transformDetails(messages)).map(toWebsiteMessage);
  node.children.forEach(transformZennExtensions);
}

function transformMessageBlocks(children: MarkdownNode[]): MarkdownNode[] {
  const transformed: MarkdownNode[] = [];
  for (let index = 0; index < children.length; index += 1) {
    const className = matchMessageClass(children[index]);
    if (className === undefined) {
      transformed.push(children[index]);
      continue;
    }
    const closingIndex = children.findIndex((child, candidateIndex) => {
      return candidateIndex > index && isTextParagraph(child, ":::");
    });
    if (closingIndex < 0) {
      transformed.push(children[index]);
      continue;
    }
    transformed.push({
      type: "container",
      data: { hName: "aside", hProperties: { className: [className] } },
      children: children.slice(index + 1, closingIndex),
    });
    index = closingIndex;
  }
  return transformed;
}

function matchMessageClass(node: MarkdownNode): string | undefined {
  if (isTextParagraph(node, ":::message")) {
    return "article-message";
  }
  return isTextParagraph(node, ":::message alert") ? "article-message-alert" : undefined;
}

function transformCaptions(children: MarkdownNode[]): MarkdownNode[] {
  const transformed: MarkdownNode[] = [];
  for (let index = 0; index < children.length; index += 1) {
    const image = children[index];
    const caption = children[index + 1];
    const inlineCaption = matchInlineCaption(image);
    if (inlineCaption !== undefined) {
      transformed.push(
        toWebsiteFigure(
          { type: "paragraph", children: [inlineCaption.image] },
          inlineCaption.caption,
        ),
      );
      continue;
    }
    if (!isImageParagraph(image) || !isCaptionParagraph(caption)) {
      transformed.push(image);
      continue;
    }
    transformed.push(toWebsiteFigure(image, caption.children ?? []));
    index += 1;
  }
  return transformed;
}

function matchInlineCaption(
  node: MarkdownNode,
): { image: MarkdownNode; caption: MarkdownNode[] } | undefined {
  const [image, newline, emphasis] = node.children ?? [];
  if (
    node.type !== "paragraph" ||
    node.children?.length !== 3 ||
    image.type !== "image" ||
    newline.type !== "text" ||
    newline.value !== "\n" ||
    emphasis.type !== "emphasis"
  ) {
    return undefined;
  }
  return { image, caption: [emphasis] };
}

function isImageParagraph(node: MarkdownNode): boolean {
  return (
    node.type === "paragraph" && node.children?.length === 1 && node.children[0].type === "image"
  );
}

function isCaptionParagraph(node: MarkdownNode | undefined): node is MarkdownNode {
  return (
    node?.type === "paragraph" &&
    node.children?.length === 1 &&
    node.children[0].type === "emphasis"
  );
}

function toWebsiteFigure(image: MarkdownNode, caption: MarkdownNode[]): MarkdownNode {
  return {
    type: "container",
    data: {
      hName: "figure",
      hProperties: { className: ["article-figure"] },
    },
    children: [
      image,
      {
        type: "paragraph",
        data: {
          hName: "figcaption",
          hProperties: { className: ["article-figure-caption"] },
        },
        children: caption,
      },
    ],
  };
}

function transformDetails(children: MarkdownNode[]): MarkdownNode[] {
  const transformed: MarkdownNode[] = [];
  for (let index = 0; index < children.length; index += 1) {
    const title = matchDetailsTitle(children[index]);
    if (title === undefined) {
      transformed.push(children[index]);
      continue;
    }
    const closing = findClosingMarker(children, index);
    if (closing === undefined) {
      transformed.push(children[index]);
      continue;
    }
    const content = children.slice(index + 1, closing.index);
    if (closing.content !== undefined) {
      content.push(closing.content);
    }
    transformed.push(toWebsiteDetails(title, content));
    index = closing.index;
  }
  return transformed;
}

function findClosingMarker(
  children: MarkdownNode[],
  openingIndex: number,
): { index: number; content?: MarkdownNode } | undefined {
  for (let index = openingIndex + 1; index < children.length; index += 1) {
    const node = children[index];
    if (isTextParagraph(node, ":::")) {
      return { index };
    }
    const text = node.children?.length === 1 ? node.children[0] : undefined;
    if (node.type === "paragraph" && text?.type === "text" && text.value?.endsWith("\n:::")) {
      return {
        index,
        content: {
          ...node,
          children: [{ ...text, value: text.value.slice(0, -4) }],
        },
      };
    }
  }
  return undefined;
}

function matchDetailsTitle(node: MarkdownNode): string | undefined {
  if (node.type !== "paragraph" || node.children?.length !== 1) {
    return undefined;
  }
  return /^:::details\s+(.+)$/u.exec(node.children[0].value ?? "")?.[1];
}

function isTextParagraph(node: MarkdownNode, value: string): boolean {
  return (
    node.type === "paragraph" &&
    node.children?.length === 1 &&
    node.children[0].type === "text" &&
    node.children[0].value === value
  );
}

function toWebsiteDetails(title: string, children: MarkdownNode[]): MarkdownNode {
  return {
    type: "container",
    data: {
      hName: "details",
      hProperties: { className: ["article-details"] },
    },
    children: [
      {
        type: "paragraph",
        data: { hName: "summary", hProperties: {} },
        children: [{ type: "text", value: title }],
      },
      ...children,
    ],
  };
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
