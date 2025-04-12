// Content script for Paste2Drive extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "uploadClipboardImage") {
      handleClipboardUpload();
    } else if (message.action === "insertLink") {
      insertLinkAtCursor(message.link);
    }
  });
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Keyboard shortcut: Ctrl+Shift+V (or Command+Shift+V on Mac)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'v') {
      event.preventDefault();
      
      // Open the popup instead of handling directly in the content script
      chrome.runtime.sendMessage({ action: "openPopup" });
    }
  });
  
  // Handle clipboard upload (legacy method, retained for compatibility)
  function handleClipboardUpload() {
    // Check authentication first
    chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
      if (!response || !response.isAuthenticated) {
        // Not authenticated, show notification or send message to open popup
        showNotification("Please authenticate with Google Drive first", "error");
        return;
      }
      
      // Get default folder from storage
      chrome.storage.sync.get(['defaultFolder'], (result) => {
        const folderId = result.defaultFolder || 'root';
        
        // Read clipboard for image data
        navigator.clipboard.read()
          .then(async (clipboardItems) => {
            for (const clipboardItem of clipboardItems) {
              // Check if clipboard has image
              const imageTypes = clipboardItem.types.filter(type => 
                type.startsWith('image/'));
              
              if (imageTypes.length > 0) {
                // Get the image type (prefer PNG if available)
                const imageType = imageTypes.includes('image/png') 
                  ? 'image/png' 
                  : imageTypes[0];
                
                // Get the image blob
                const blob = await clipboardItem.getType(imageType);
                
                // Process the image (handle compression if needed)
                const processedImage = await processImage(blob);
                
                // Generate filename
                const filename = await generateFilename(processedImage.type);
                
                // Show upload indicator
                const uploadingId = await showNotification("Uploading to Drive...", "info");
                
                // Send to background for upload
                chrome.runtime.sendMessage(
                  { 
                    action: "uploadImage", 
                    imageData: processedImage.dataUrl, 
                    folder: folderId,
                    filename: filename
                  }, 
                  (response) => {
                    // Hide the uploading notification
                    hideNotification(uploadingId);
                    
                    if (response && response.success) {
                      // Show success notification
                      showNotification("Upload successful!", "success");
                      
                      // Format the link according to user preferences
                      formatLink(response.shareableLink)
                        .then(formattedLink => {
                          // Copy to clipboard
                          navigator.clipboard.writeText(formattedLink)
                            .then(() => {
                              showNotification("Link copied to clipboard", "success");
                            })
                            .catch(err => {
                              showNotification("Could not copy link to clipboard", "error");
                            });
                        });
                    } else {
                      // Show error notification
                      showNotification("Upload failed: " + (response && response.error ? response.error : "Unknown error"), "error");
                    }
                  }
                );
                
                // Only process the first image
                break;
              }
            }
          })
          .catch(error => {
            console.error('Error accessing clipboard:', error);
            showNotification("Could not access clipboard: " + error.message, "error");
          });
      });
    });
  }
  
  // Insert link at cursor position
  function insertLinkAtCursor(link) {
    // Different handling based on which Google app we're in
    const host = window.location.hostname;
    
    if (host.includes('docs.google.com')) {
      // Google Docs - need to use clipboard as direct insertion is complex
      navigator.clipboard.writeText(link)
        .then(() => {
          showNotification("Link copied to clipboard. Press Ctrl+V to paste", "success");
        })
        .catch(err => {
          showNotification("Could not copy link to clipboard", "error");
        });
    } 
    else if (host.includes('sheets.google.com')) {
      // For Google Sheets, we can try to select the active cell and insert
      navigator.clipboard.writeText(link)
        .then(() => {
          showNotification("Link copied to clipboard. Press Ctrl+V to paste in the active cell", "success");
        })
        .catch(err => {
          showNotification("Could not copy link to clipboard", "error");
        });
    }
    else if (host.includes('slides.google.com')) {
      // For Google Slides
      navigator.clipboard.writeText(link)
        .then(() => {
          showNotification("Link copied to clipboard. Press Ctrl+V to paste", "success");
        })
        .catch(err => {
          showNotification("Could not copy link to clipboard", "error");
        });
    }
  }