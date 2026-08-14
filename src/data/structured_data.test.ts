import { expect, test } from "vitest";

import { profile } from "./profile";
import { createWebSiteJsonLd, serializeJsonLd } from "./structured_data";

test("describes the canonical site name on the domain homepage", () => {
  expect(createWebSiteJsonLd("https://furedea.com/")).toEqual({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://furedea.com/#website",
    url: "https://furedea.com/",
    name: profile.name.en,
    alternateName: [profile.name.ja, "furedea.com"],
  });
});

test("serializes JSON-LD without executable closing script tags", () => {
  const data = { headline: "</script><script>alert('xss')</script>" };

  const serialized = serializeJsonLd(data);

  expect(serialized).not.toContain("</script>");
  expect(JSON.parse(serialized)).toEqual(data);
});
