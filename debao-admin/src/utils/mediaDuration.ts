export function mediaFileKind(file: Pick<File, 'name' | 'type'>): 'audio' | 'video' | 'document' {
  if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|opus|aiff)$/i.test(file.name)) return 'audio';
  if (file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v|mpeg|mpg)$/i.test(file.name)) return 'video';
  return 'document';
}

/** Read metadata without playing or uploading the file. Always release the object URL. */
export function readMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const media = document.createElement(mediaFileKind(file) === 'audio' ? 'audio' : 'video');
    const url = URL.createObjectURL(file);
    let finished = false;
    const finish = (duration?: number) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      media.onloadedmetadata = null;
      media.onerror = null;
      media.removeAttribute('src');
      media.load();
      URL.revokeObjectURL(url);
      if (duration !== undefined && Number.isFinite(duration) && duration > 0) resolve(Math.max(1, Math.round(duration)));
      else reject(new Error(`${file.name} 无法读取时长，请在手动添加中填写时长后保存`));
    };
    const timer = setTimeout(() => finish(), 15000);
    media.preload = 'metadata';
    media.onloadedmetadata = () => finish(media.duration);
    media.onerror = () => finish();
    media.src = url;
  });
}

export function formatMediaDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return '未读取';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const remainder = total % 60;
  return hours ? `${hours}小时 ${minutes}分 ${remainder}秒` : `${minutes}分 ${remainder}秒`;
}
