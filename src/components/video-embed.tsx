import { getVideoEmbedUrl } from "@/lib/video-embed";

export function VideoEmbed({ url, className = "" }: { url: string; className?: string }) {
  const embedUrl = getVideoEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex aspect-video items-center justify-center bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800 ${className}`}
      >
        Ver video ↗
      </a>
    );
  }

  return (
    <div className={`aspect-video ${className}`}>
      <iframe
        src={embedUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
