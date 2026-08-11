# ADR-0009: Manage site records as validated YAML content

- Status: Accepted
- Date: 2026-08-12

In the context of maintaining publications and homepage news, facing duplicated facts and code or
test edits for each editorial update, we decided for one schema-validated YAML file per record with
publication announcements projected into News and against TypeScript data arrays, duplicated News
records, JSON, and TOML, to achieve concise reviewable content and one canonical source per
achievement, accepting YAML's indentation sensitivity and an asynchronous content query layer.
