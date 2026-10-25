import { describe, expect, it } from "vitest";
import { SOURCES, getEmbedUrl } from "@/lib/servers";

describe("player source", () => {
  it("embeds Vidly directly so the iframe keeps its fullscreen grant", () => {
    // embed.filmu.in serves the same app but bounces to vidly.pro in-frame,
    // which drops the iframe permission policy (fullscreen/autoplay).
    expect(SOURCES[0].baseUrl).toBe("https://vidly.pro");
  });

  it("builds movie and episode URLs on the direct host", () => {
    expect(getEmbedUrl(0, "movie", 27205)).toBe("https://vidly.pro/movie/27205");
    expect(getEmbedUrl(0, "tv", 1396, 1, 2)).toBe("https://vidly.pro/tv/1396/1/2");
    expect(getEmbedUrl(0, "tv", 1396)).toBe("https://vidly.pro/tv/1396/1/1");
  });
});
