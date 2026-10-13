import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const forbidden = [
  "@/lib/mock",
  "@/lib/tasks",
  "@/lib/evaluation",
  "@/lib/master-data",
  "@/lib/integration",
  "@/lib/exports",
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("UI boundary", () => {
  it("screens call the client instead of local engines or fixtures", () => {
    const root = join(process.cwd(), "src");
    const files = [
      ...walk(join(root, "app")),
      ...walk(join(root, "components")),
    ].filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
    const hits = files.flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return forbidden
        .filter((spec) =>
          new RegExp("from\\s+[\"']" + spec + "[\"']").test(text),
        )
        .map((spec) => file + " imports " + spec);
    });
    expect(hits).toEqual([]);
  });
});
