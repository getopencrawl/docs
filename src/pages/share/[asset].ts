import type { APIRoute, GetStaticPaths } from "astro";
import { root } from "astro:config/server";
import { fileURLToPath } from "node:url";
import { getVisibleEntries } from "@cloudflare/nimbus-docs/runtime";
import { cardId } from "../../../scripts/share/metadata.mjs";
import { render } from "../../../scripts/share/render.mjs";

const formats = {
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
} as const;

export const getStaticPaths = (async () => {
  const pages = new Map<string, { title: string; description: string }>();
  for (const entry of await getVisibleEntries(["docs"])) {
    const { title, description = "" } = entry.data;
    pages.set(cardId(fileURLToPath(root), title, description), {
      title,
      description,
    });
  }
  return Array.from(pages).flatMap(([id, page]) =>
    (Object.keys(formats) as (keyof typeof formats)[]).map((ext) => ({
      params: { asset: id + "." + ext },
      cacheKey: id + "." + ext,
      props: { ...page, id, ext },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute<{
  id: string;
  title: string;
  description: string;
  ext: keyof typeof formats;
}> = async ({ props }) => {
  const bytes = await render(
    fileURLToPath(root),
    props.id,
    props.title,
    props.description,
    props.ext,
  );
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": formats[props.ext] },
  });
};
