export function getVideoEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    const shorts = u.pathname.match(/\/shorts\/([\w-]+)/);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    const embed = u.pathname.match(/\/embed\/([\w-]+)/);
    if (embed) return `https://www.youtube.com/embed/${embed[1]}`;
  }

  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}
