// HTML template for WebView-based image cropping using Cropper.js
export const getCropperHtml = (imageBase64: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Crop Image</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #000;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    #container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
    }
    
    #image {
      max-width: 100%;
      max-height: 100%;
      display: block;
    }
    
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      text-align: center;
    }
    
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Cropper.js custom styles for mobile */
    .cropper-container {
      touch-action: none;
    }
    
    .cropper-view-box {
      outline: 1px solid rgba(255, 255, 255, 0.75);
      outline-color: rgba(255, 255, 255, 0.75);
    }
    
    .cropper-point {
      width: 12px !important;
      height: 12px !important;
      background-color: #fff;
      border-radius: 50%;
      opacity: 1;
    }
    
    .cropper-line {
      background-color: rgba(255, 255, 255, 0.5);
    }
    
    .cropper-dashed {
      border-color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div id="container">
    <img id="image" src="${imageBase64}">
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
  <script>
    let cropper = null;
    const image = document.getElementById('image');

    // Initialize cropper when image loads
    image.onload = function() {
      cropper = new Cropper(image, {
        viewMode: 1,
        dragMode: 'move',
        aspectRatio: NaN, // Free aspect ratio
        autoCropArea: 0.9,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        responsive: true,
        checkOrientation: true,
        minContainerWidth: 200,
        minContainerHeight: 200,
        ready: function() {
          // Notify React Native that cropper is ready
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }
      });
    };

    // Handle error
    image.onerror = function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: 'Failed to load image'
      }));
    };

    // Listen for messages from React Native
    document.addEventListener('message', function(event) {
      console.log('[WebView] Received message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('[WebView] Parsed data:', data);
        
        if (data.action === 'crop') {
          console.log('[WebView] Crop action received');
          if (!cropper) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Cropper not initialized'
            }));
            return;
          }

          try {
            const canvas = cropper.getCroppedCanvas({
              maxWidth: 4096,
              maxHeight: 4096,
              fillColor: '#fff',
              imageSmoothingEnabled: true,
              imageSmoothingQuality: 'high',
            });

            const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'cropped',
              data: croppedBase64
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          }
        } else if (data.action === 'rotate') {
          console.log('[WebView] Rotate action received');
          if (cropper) {
            cropper.rotate(data.degrees || 90);
          }
        } else if (data.action === 'reset') {
          console.log('[WebView] Reset action received');
          if (cropper) {
            cropper.reset();
          }
        }
      } catch (error) {
        console.error('[WebView] Failed to parse message:', error);
      }
    });

    // Also listen on window for compatibility
    window.addEventListener('message', function(event) {
      document.dispatchEvent(new MessageEvent('message', { data: event.data }));
    });

    // Start loading the image
    image.src = "${imageBase64}";
  </script>
</body>
</html>
`;
