export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
  maxOutputSizeBytes?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1800,
  maxHeight: 1800,
  quality: 0.85,
  mimeType: 'image/jpeg',
  maxOutputSizeBytes: 8 * 1024 * 1024 // 8 MB target
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
};

const calculateDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  let newWidth = width;
  let newHeight = height;

  if (newWidth > maxWidth) {
    const ratio = maxWidth / newWidth;
    newWidth = maxWidth;
    newHeight = newHeight * ratio;
  }

  if (newHeight > maxHeight) {
    const ratio = maxHeight / newHeight;
    newHeight = maxHeight;
    newWidth = newWidth * ratio;
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) };
};

export const compressImage = async (file: File, options: CompressionOptions = {}): Promise<File> => {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await readFileAsDataURL(file);
    const image = await loadImage(dataUrl);

    const { width, height } = calculateDimensions(
      image.width,
      image.height,
      config.maxWidth,
      config.maxHeight
    );

    // If the image is already within bounds, and size under threshold, skip compression
    if (width === image.width && height === image.height && file.size <= config.maxOutputSizeBytes) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }
    ctx.drawImage(image, 0, 0, width, height);

    let quality = config.quality;
    let mimeType = config.mimeType;

    // Preserve PNG if transparency is expected
    if (file.type === 'image/png' && config.mimeType === DEFAULT_OPTIONS.mimeType) {
      mimeType = 'image/png';
    }

    let blob = await canvasToBlob(canvas, mimeType, quality);

    // Iteratively reduce quality if still too large
    while (blob && blob.size > config.maxOutputSizeBytes && quality > 0.4) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, mimeType, quality);
    }

    if (!blob || blob.size >= file.size) {
      // Compression didn't help; return original
      return file;
    }

    const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const compressedFileName = file.name.replace(/\.[^.]+$/, `.${extension}`);

    return new File([blob], compressedFileName, {
      type: mimeType,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Image compression failed, using original file:', error);
    return file;
  }
};
