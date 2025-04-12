// Utility functions for Paste2Drive extension

/**
 * Generate a filename based on current settings
 * @param {string} fileType - The file extension/type (e.g., 'png')
 * @returns {string} - The generated filename
 */
function generateFilename(fileType) {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        fileNaming: 'timestamp',
        customPrefix: 'image_'
      }, (settings) => {
        let filename = '';
        
        // Get current date/time
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
        
        // Set prefix based on settings
        if (settings.fileNaming === 'custom') {
          filename = settings.customPrefix || 'image_';
        } else {
          filename = 'image_';
        }
        
        // Add date/time based on settings
        if (settings.fileNaming === 'timestamp') {
          filename += `${dateStr}-${timeStr}`;
        } else if (settings.fileNaming === 'date') {
          filename += dateStr;
        } else {
          // For custom prefix, still add a timestamp
          filename += now.getTime();
        }
        
        // Add file extension
        filename += `.${fileType}`;
        
        resolve(filename);
      });
    });
  }
  
  /**
   * Format a link according to user preferences
   * @param {string} url - The URL to format
   * @returns {string} - The formatted link
   */
  function formatLink(url) {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        linkFormat: 'direct',
        linkText: 'Image Link'
      }, (settings) => {
        let formattedLink = url;
        
        if (settings.linkFormat === 'html') {
          formattedLink = `<a href="${url}" target="_blank">${settings.linkText || 'Image Link'}</a>`;
        } else if (settings.linkFormat === 'markdown') {
          formattedLink = `[${settings.linkText || 'Image Link'}](${url})`;
        }
        
        resolve(formattedLink);
      });
    });
  }
  
  /**
   * Process an image from clipboard
   * @param {Blob} blob - The image blob from clipboard
   * @returns {Promise<{dataUrl: string, type: string}>} - Processed image data and type
   */
  function processImage(blob) {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        imageQuality: 'original'
      }, (settings) => {
        // For original quality or PNG, just return the blob as is
        if (settings.imageQuality === 'original' || blob.type === 'image/png') {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve({
              dataUrl: reader.result,
              type: blob.type.split('/')[1] // Extract 'png', 'jpeg', etc.
            });
          };
          return;
        }
        
        // For other quality settings, convert to JPEG with specified quality
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Map quality settings to values
        const qualityMap = {
          high: 0.9,
          medium: 0.75,
          low: 0.5
        };
        
        const quality = qualityMap[settings.imageQuality] || 0.9;
        
        const url = URL.createObjectURL(blob);
        img.src = url;
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            dataUrl,
            type: 'jpeg'
          });
        };
      });
    });
  }
  
  /**
   * Show notification in content script context
   * @param {string} message - The message to display
   * @param {string} type - The notification type (info, success, error, warning)
   * @returns {string} - ID of the notification element
   */
  function showNotification(message, type = "info") {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        showNotifications: true,
        notificationDuration: 3
      }, (settings) => {
        if (!settings.showNotifications) {
          resolve(null);
          return;
        }
        
        const id = 'paste2drive-notification-' + Date.now();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = id;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '4px';
        notification.style.color = '#fff';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '14px';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        
        // Set notification color based on type
        switch(type) {
          case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
          case 'error':
            notification.style.backgroundColor = '#F44336';
            break;
          case 'warning':
            notification.style.backgroundColor = '#FF9800';
            break;
          case 'info':
          default:
            notification.style.backgroundColor = '#2196F3';
        }
        
        notification.textContent = message;
        
        // Add notification to page
        document.body.appendChild(notification);
        
        // Remove notification after specified duration
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 300);
          }
        }, settings.notificationDuration * 1000);
        
        resolve(id);
      });
    });
  }
  
  /**
   * Hide notification in content script context
   * @param {string} id - ID of the notification to hide
   */
  function hideNotification(id) {
    if (!id) return;
    
    const notification = document.getElementById(id);
    if (notification) {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }
  
  // Export the utility functions if in a module context
  if (typeof module !== 'undefined') {
    module.exports = {
      generateFilename,
      formatLink,
      processImage,
      showNotification,
      hideNotification
    };
  }