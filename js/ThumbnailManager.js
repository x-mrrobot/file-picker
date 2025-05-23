const ThumbnailManager = (function (env, cache, appState) {
  const queue = [];
  let processing = false;
  const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']; // Add more if needed
  const THUMBNAIL_PREFIX = "thumb_";
  const THUMBNAIL_WIDTH = 64; // Target width
  const THUMBNAIL_HEIGHT = 64; // Target height

  // Local getFileExtension removed, will use Utils.getFileExtension

  function isImage(filePath) {
    // Ensure Utils is available, otherwise this will fail.
    // It's assumed Utils is loaded before ThumbnailManager.
    const extension = typeof Utils !== 'undefined' ? Utils.getFileExtension(filePath) : '';
    return supportedExtensions.includes(extension);
  }

  function addToQueue(filePath) {
    if (!isImage(filePath)) return;
    if (cache.get(THUMBNAIL_PREFIX + filePath)) return; // Already cached
    if (queue.includes(filePath) || (processing && queue[0] === filePath) ) return; // Already in queue or being processed

    queue.push(filePath);
    processQueue();
  }

  async function processQueue() {
    if (processing || queue.length === 0) {
      return;
    }
    processing = true;
    const filePath = queue.shift(); // Get first item

    try {
      const base64Data = await env.execute("get_file_content_base64", filePath);
      if (!base64Data) throw new Error("No base64 data returned");

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions while maintaining aspect ratio
        let width = image.width;
        let height = image.height;

        if (width > height) {
          if (width > THUMBNAIL_WIDTH) {
            height = Math.round(height * (THUMBNAIL_WIDTH / width));
            width = THUMBNAIL_WIDTH;
          }
        } else {
          if (height > THUMBNAIL_HEIGHT) {
            width = Math.round(width * (THUMBNAIL_HEIGHT / height));
            height = THUMBNAIL_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        const thumbnailUrl = canvas.toDataURL(); // Defaults to PNG, or image.src type if it's a data URL

        cache.save(THUMBNAIL_PREFIX + filePath, { thumbnailUrl: thumbnailUrl } , {}); // Store as an object to match CacheManager's expected structure
        appState.emit("THUMBNAIL_READY", { filePath: filePath, thumbnailUrl: thumbnailUrl });
        
        processing = false;
        processQueue(); // Process next
      };
      image.onerror = (error) => {
        console.error("ThumbnailManager: Image load error for " + filePath, error);
        processing = false;
        processQueue(); // Process next
      };
      image.src = base64Data;

    } catch (error) {
      console.error(`ThumbnailManager: Error processing ${filePath}:`, error);
      processing = false;
      processQueue(); // Process next
    }
  }

  return {
    addToQueue,
    isImage // Expose isImage
  };

})(currentEnvironment, CacheManager, AppState);
