import { expect, test } from "vitest";

import { serializeJsonLd } from "./structured_data";

test("serializes JSON-LD without executable closing script tags", () => {
  const data = { headline: "</script><script>alert('xss')</script>" };

  const serialized = serializeJsonLd(data);

  expect(serialized).not.toContain("</script>");
  expect(JSON.parse(serialized)).toEqual(data);
});
