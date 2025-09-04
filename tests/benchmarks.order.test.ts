import { describe, it, expect } from "vitest";
import { BENCHMARKS } from "@/lib/data/benchmarks";

describe("BENCHMARKS key order", () => {
  it('keeps "default" first and the rest sorted A→Z', () => {
    const keys = Object.keys(BENCHMARKS);
    expect(keys[0]).toBe("default");
    const rest = keys.slice(1);
    const sorted = [...rest].sort((a, b) => a.localeCompare(b));
    expect(rest).toEqual(sorted);
  });
});
