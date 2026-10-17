/**
 * Converts a File object to a Base64 Data URL string.
 * Optimizes large photo dimensions (max 1280px) so JSON exports remain compact and portable.
 */
export async function fileToDataUrl(file: File, maxDimension = 1280): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      // Create an image element to compress/resize if large
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width <= maxDimension && height <= maxDimension) {
          // No resizing needed, return raw dataUrl
          resolve(result);
          return;
        }

        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Re-links missing image URLs in items array by matching file names from a newly selected folder.
 */
export function relinkItemsWithFiles<T extends { name: string; url: string; dataUrl?: string }>(
  items: T[],
  files: File[]
): { updatedItems: T[]; matchedCount: number } {
  const fileMap = new Map<string, File>();
  for (const file of files) {
    fileMap.set(file.name.toLowerCase(), file);
  }

  let matchedCount = 0;
  const updatedItems = items.map((item) => {
    const file = fileMap.get(item.name.toLowerCase());
    if (file) {
      matchedCount++;
      const objectUrl = URL.createObjectURL(file);
      return {
        ...item,
        url: objectUrl,
      };
    }
    return item;
  });

  return { updatedItems, matchedCount };
}
