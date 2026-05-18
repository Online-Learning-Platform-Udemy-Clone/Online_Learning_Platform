export function getVideoEmbed(url) {
  if (!url) return null;

  const trimmedUrl = url.trim();

  try {
    const parsed = new URL(trimmedUrl);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      const shortsId = parsed.pathname.startsWith("/shorts/")
        ? parsed.pathname.split("/").filter(Boolean)[1]
        : "";
      const embedId = parsed.pathname.startsWith("/embed/")
        ? parsed.pathname.split("/").filter(Boolean)[1]
        : "";
      const id = videoId || shortsId || embedId;
      if (id) return { type: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }

    if (host === "drive.google.com") {
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) return { type: "iframe", src: `https://drive.google.com/file/d/${match[1]}/preview` };
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return { type: "iframe", src: `https://player.vimeo.com/video/${videoId}` };
    }
  } catch {
    return { type: "video", src: trimmedUrl };
  }

  return { type: "video", src: trimmedUrl };
}
