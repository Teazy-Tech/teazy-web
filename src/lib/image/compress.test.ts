import { describe, expect, it } from "vitest";
import { compressImage, fitWithin, mapWithConcurrency } from "./compress";

describe("fitWithin", () => {
  it("scales the long edge down and keeps the aspect ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("never upscales", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe("compressImage", () => {
  it("passes PDFs and small images through unchanged", async () => {
    const pdf = new File(["%PDF"], "script.pdf", { type: "application/pdf" });
    const small = new File(["x"], "tiny.jpg", { type: "image/jpeg" });
    expect(await compressImage(pdf)).toBe(pdf);
    expect(await compressImage(small)).toBe(small);
  });
});

describe("mapWithConcurrency", () => {
  it("keeps order and never exceeds the limit", async () => {
    let running = 0;
    let peak = 0;
    const out = await mapWithConcurrency([5, 1, 4, 2, 3], 2, async (n) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, n));
      running--;
      return n * 10;
    });
    expect(out).toEqual([50, 10, 40, 20, 30]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
