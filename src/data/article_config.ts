interface ArticleConfig {
  esa: {
    team: string;
    category: string;
  };
}

export function parseArticleConfig(source: string): ArticleConfig {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new Error("article_config.json must contain valid JSON.");
  }
  if (!isArticleConfig(value)) {
    throw new Error("article_config.json must contain non-empty esa publishing settings.");
  }
  return value;
}

function isArticleConfig(value: unknown): value is ArticleConfig {
  if (typeof value !== "object" || value === null || !("esa" in value)) {
    return false;
  }
  const esa = value.esa;
  return (
    typeof esa === "object" &&
    esa !== null &&
    "team" in esa &&
    isNonEmptyString(esa.team) &&
    "category" in esa &&
    isNonEmptyString(esa.category)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
