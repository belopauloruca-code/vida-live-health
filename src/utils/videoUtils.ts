export interface VideoSource {
  type: 'youtube' | 'vimeo' | 'file' | 'unknown';
  src: string;
  originalUrl?: string;
}

export function getEmbedSource(url: string): VideoSource {
  if (!url) return { type: 'unknown', src: '' };

  const isMp4 = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  if (isMp4) return { type: 'file', src: url };

  // YouTube: watch -> embed, youtu.be -> embed
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/
  );
  if (ytMatch?.[1]) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`,
      originalUrl: url,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    const id = vimeoMatch[1];
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${id}`,
      originalUrl: url,
    };
  }

  return { type: 'unknown', src: url, originalUrl: url };
}