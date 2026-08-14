const { chromium } = require("@playwright/test");

const PAGE_ASSERTIONS = {
  "categories:performance": ["error", { minScore: 0.9 }],
  "first-contentful-paint": ["error", { maxNumericValue: 2_800 }],
  "largest-contentful-paint": ["error", { maxNumericValue: 2_800 }],
  "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
  "total-blocking-time": ["error", { maxNumericValue: 200 }],
  "resource-summary:total:size": ["error", { maxNumericValue: 850_000 }],
  "resource-summary:total:count": ["error", { maxNumericValue: 40 }],
  "resource-summary:script:size": ["error", { maxNumericValue: 0 }],
  "resource-summary:script:count": ["error", { maxNumericValue: 0 }],
  "resource-summary:image:size": ["error", { maxNumericValue: 40_000 }],
  "resource-summary:image:count": ["error", { maxNumericValue: 2 }],
  "resource-summary:font:size": ["error", { maxNumericValue: 700_000 }],
  "resource-summary:font:count": ["error", { maxNumericValue: 35 }],
};

const ARTICLE_ASSERTIONS = {
  "categories:performance": ["error", { minScore: 0.8 }],
  "first-contentful-paint": ["error", { maxNumericValue: 3_500 }],
  "largest-contentful-paint": ["error", { maxNumericValue: 4_500 }],
  "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
  "total-blocking-time": ["error", { maxNumericValue: 200 }],
  "resource-summary:total:size": ["error", { maxNumericValue: 1_900_000 }],
  "resource-summary:total:count": ["error", { maxNumericValue: 90 }],
  "resource-summary:script:size": ["error", { maxNumericValue: 260_000 }],
  "resource-summary:script:count": ["error", { maxNumericValue: 40 }],
  "resource-summary:image:size": ["error", { maxNumericValue: 650_000 }],
  "resource-summary:image:count": ["error", { maxNumericValue: 3 }],
  "resource-summary:font:size": ["error", { maxNumericValue: 850_000 }],
  "resource-summary:font:count": ["error", { maxNumericValue: 45 }],
};

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      chromePath: chromium.executablePath(),
      numberOfRuns: 3,
      maxAutodiscoverUrls: 0,
      staticDirFileDiscoveryDepth: 5,
      autodiscoverUrlBlocklist: ["/index.html", "/404.html"],
      settings: {
        onlyCategories: ["performance"],
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: "/(?:ja|en)/(?:index\\.html|blog/index\\.html)$",
          aggregationMethod: "median",
          assertions: PAGE_ASSERTIONS,
        },
        {
          matchingUrlPattern: "/(?:ja|en)/blog/.+/index\\.html$",
          aggregationMethod: "median",
          assertions: ARTICLE_ASSERTIONS,
        },
      ],
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-results",
    },
  },
};
