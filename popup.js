// Show notification in popup
function showPopupNotification(message, type = "info") {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('popup-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'popup-notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = 'notification ' + type;
    
    // Show the notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  


// Process image using utility.js function if available, otherwise provide fallback
function processImage(blob) {
    // IMPORTANT: Avoid calling window.processImage to prevent recursion
    // Create a direct fallback implementation instead
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve({
          dataUrl: reader.result,
          type: blob.type.split('/')[1] || 'png' // Extract 'png', 'jpeg', etc. with fallback
        });
      };
    });
  }
  
  // Generate filename using utility.js function if available, otherwise provide fallback
  function generateFilename(fileType) {
    // IMPORTANT: Avoid calling window.generateFilename to prevent recursion
    // Create a direct fallback implementation instead
    return new Promise((resolve) => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
      const filename = `image_${dateStr}-${timeStr}.${fileType}`;
      resolve(filename);
    });
  }
  
  // Process and upload image with improved error handling
  function processAndUploadImage(blob) {
    console.log('Starting image processing with blob type:', blob ? blob.type : 'undefined blob');
    
    // Guard against null blob
    if (!blob) {
      console.error('No valid blob to process');
      resetUploadUI();
      showPopupNotification("Error: No valid image data found", "error");
      return;
    }
  
    // Use try-catch with the promise chain for better error handling
    try {
      // Process the image (handle compression if needed)
      processImage(blob)
        .then(processedImage => {
          console.log('Image processed, generating filename...');
          // Generate filename
          return generateFilename(processedImage.type)
            .then(filename => {
              console.log('Filename generated:', filename);
              return { 
                imageData: processedImage.dataUrl, 
                filename: filename 
              };
            });
        })
        .then(({ imageData, filename }) => {
          // Get the current folder ID
          const folderId = currentFolderId || 'root';
          
          console.log('Sending upload request to folder:', folderId);
          
          // Upload to Google Drive
          chrome.runtime.sendMessage(
            { 
              action: "uploadImage", 
              imageData: imageData, 
              folder: folderId,
              filename: filename
            }, 
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('Chrome runtime error:', chrome.runtime.lastError);
                resetUploadUI();
                showPopupNotification("Upload failed: " + chrome.runtime.lastError.message, "error");
                return;
              }
              
              if (response && response.success) {
                console.log('Upload successful, file ID:', response.fileId);
                // Show success UI
                showSuccessUI(response.shareableLink, response.fileId);
                // Reload the folder contents to show the new file
                loadFolders(currentFolderId);
              } else {
                // Show error
                console.error('Upload failed:', response ? response.error : 'Unknown error');
                resetUploadUI();
                showPopupNotification("Upload failed: " + (response && response.error ? response.error : "Unknown error"), "error");
              }
            }
          );
        })
        .catch(error => {
          console.error('Error in promise chain:', error);
          resetUploadUI();
          showPopupNotification("Error processing image: " + (error.message || "Unknown error"), "error");
        });
    } catch (outerError) {
      console.error('Critical error in upload process:', outerError);
      resetUploadUI();
      showPopupNotification("Critical error: " + (outerError.message || "Unknown error"), "error");
    }
  }
  
  // Enhanced clipboard upload function
  function handleUploadFromClipboard() {
    // Check authentication
    chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
      if (!response || !response.isAuthenticated) {
        showPopupNotification("Please authenticate with Google Drive first", "error");
        return;
      }
      
      // Start upload process
      showUploadingUI();
      
      // Read clipboard
      navigator.clipboard.read()
        .then(async (clipboardItems) => {
          if (!clipboardItems || clipboardItems.length === 0) {
            throw new Error("Clipboard is empty");
          }
          
          let foundImage = false;
          
          for (const clipboardItem of clipboardItems) {
            // Check if clipboard has image
            const imageTypes = clipboardItem.types.filter(type => 
              type.startsWith('image/'));
            
            if (imageTypes.length > 0) {
              console.log('Found image type in clipboard:', imageTypes);
              // Get the image type (prefer PNG if available)
              const imageType = imageTypes.includes('image/png') 
                ? 'image/png' 
                : imageTypes[0];
              
              try {
                // Get the image blob
                const blob = await clipboardItem.getType(imageType);
                console.log('Got image blob of type:', blob.type, 'size:', blob.size);
                foundImage = true;
                
                // Upload the image
                processAndUploadImage(blob);
                break;
              } catch (error) {
                console.error('Error getting image from clipboard:', error);
                throw error;
              }
            }
          }
          
          if (!foundImage) {
            resetUploadUI();
            showPopupNotification("No image found in clipboard", "error");
          }
        })
        .catch(error => {
          console.error('Error accessing clipboard:', error);
          resetUploadUI();
          showPopupNotification("Could not access clipboard: " + error.message, "error");
        });
    });
  }
  
  // Popup script for Paste2Drive extension
  
  // DOM elements
  const loginView = document.getElementById('login-view');
  const mainView = document.getElementById('main-view');
  const loadingView = document.getElementById('loading-view');
  const loginButton = document.getElementById('login-button');
  const changeAccountButton = document.getElementById('change-account-button');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const folderBrowser = document.getElementById('folder-browser');
  const folderPath = document.getElementById('folder-path');
  const newFolderName = document.getElementById('new-folder-name');
  const createFolderButton = document.getElementById('create-folder-button');
  const openSettings = document.getElementById('open-settings');
  const uploadClipboard = document.getElementById('upload-clipboard');
  const uploadArea = document.getElementById('upload-area');
  const resultSection = document.getElementById('result-section');
  const resultLink = document.getElementById('result-link');
  const copyLink = document.getElementById('copy-link');
  const viewFile = document.getElementById('view-file');
  const newUpload = document.getElementById('new-upload');
  const previousUploadsSection = document.getElementById('previous-uploads-section');
  const previousUploadsContainer = document.getElementById('previous-uploads-container');
  
  // Current state
  let currentFolderId = 'root';
  let pathHistory = [{ id: 'root', name: 'My Drive' }];
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', initializePopup);
  if (loginButton) loginButton.addEventListener('click', handleLogin);
  if (changeAccountButton) changeAccountButton.addEventListener('click', handleChangeAccount);
  if (createFolderButton) createFolderButton.addEventListener('click', handleCreateFolder);
  if (folderPath) folderPath.addEventListener('click', handlePathClick);
  if (openSettings) openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  if (uploadClipboard) uploadClipboard.addEventListener('click', handleUploadFromClipboard);
  if (uploadArea) uploadArea.addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.click();
  });
  if (copyLink) copyLink.addEventListener('click', handleCopyLink);
  if (viewFile) viewFile.addEventListener('click', handleViewFile);
  if (newUpload) newUpload.addEventListener('click', resetUploadUI);
  
  // Add file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'file-input';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  fileInput.addEventListener('change', handleFileSelect);
  
  // Add drag and drop listeners
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
  }
  
  // Initialize popup
  function initializePopup() {
    console.log('Initializing popup...');
    showView(loadingView);
    
    // Remove any previous error messages
    const errorElements = document.querySelectorAll('.login-error');
    errorElements.forEach(el => el.remove());
    
    // Check if user is authenticated
    chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
      console.log('Auth check response:', response);
      
      if (response && response.isAuthenticated && response.userInfo) {
        // User is authenticated
        updateUserInfo(response.userInfo);
        showView(mainView);
        
        // Get current default folder from storage
        chrome.storage.sync.get(['defaultFolder', 'defaultFolderPath'], (result) => {
          if (result.defaultFolder && result.defaultFolderPath) {
            currentFolderId = result.defaultFolder;
            updatePathFromSaved(result.defaultFolderPath);
            loadFolders(currentFolderId);
          } else {
            // Use root folder as default
            currentFolderId = 'root';
            pathHistory = [{ id: 'root', name: 'My Drive' }];
            updatePathDisplay();
            loadFolders(currentFolderId);
          }
        });
      } else {
        // User is not authenticated, prompt for login
        showView(loginView);
        
        // Show error if there is one
        if (response && response.error) {
          showLoginError(response.error);
        }
      }
    });
  }
  
  // Show login error
  function showLoginError(message) {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.login-error');
    existingErrors.forEach(el => el.remove());
    
    // Create error message element
    const errorMsg = document.createElement('div');
    errorMsg.className = 'login-error';
    errorMsg.textContent = `Authentication error: ${message}`;
    
    // Add to login view
    const loginPrompt = document.querySelector('.login-prompt');
    if (loginPrompt) {
      loginPrompt.appendChild(errorMsg);
    }
  }
  
  // Show specified view and hide others
  function showView(viewToShow) {
    if (loginView) loginView.classList.add('hidden');
    if (mainView) mainView.classList.add('hidden');
    if (loadingView) loadingView.classList.add('hidden');
    
    if (viewToShow) viewToShow.classList.remove('hidden');
  }
  
  // Handle login button click
  function handleLogin() {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.login-error');
    existingErrors.forEach(el => el.remove());
    
    showView(loadingView);
    
    chrome.runtime.sendMessage({ action: "authenticate" }, (response) => {
      console.log('Authentication response:', response);
      
      if (response && response.success && response.userInfo) {
        updateUserInfo(response.userInfo);
        showView(mainView);
        loadFolders('root');
      } else {
        // Show error message
        showView(loginView);
        
        if (response && response.error) {
          showLoginError(response.error);
        } else {
          showLoginError("Authentication failed. Please try again.");
        }
      }
    });
  }
  
  // Handle change account button click
function handleChangeAccount() {
    showView(loadingView);
    
    // Initially hide previous uploads section - don't clear its contents yet
    if (previousUploadsSection) {
      previousUploadsSection.classList.add('hidden');
    }
    
    // Hide the result section if it's visible
    if (resultSection) {
      resultSection.classList.add('hidden');
    }
    
    // Reset the upload area
    resetUploadUI();
    
    chrome.runtime.sendMessage({ action: "changeAccount" }, (response) => {
      if (response && response.success && response.userInfo) {
        updateUserInfo(response.userInfo);
        
        // Reset to root folder
        currentFolderId = 'root';
        pathHistory = [{ id: 'root', name: 'My Drive' }];
        updatePathDisplay();
        
        // Load folders for the new account's root
        loadFolders('root');
        
        showView(mainView);
      } else {
        showView(loginView);
        if (response && response.error) {
          showLoginError(response.error);
        }
      }
    });
  }
  
  // Handle upload from clipboard
  function handleUploadFromClipboard() {
    // Check authentication
    chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
      if (!response || !response.isAuthenticated) {
        showPopupNotification("Please authenticate with Google Drive first", "error");
        return;
      }
      
      // Start upload process
      showUploadingUI();
      
      // Read clipboard
      navigator.clipboard.read()
        .then(async (clipboardItems) => {
          let foundImage = false;
          
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
              foundImage = true;
              
              // Upload the image
              processAndUploadImage(blob);
              break;
            }
          }
          
          if (!foundImage) {
            resetUploadUI();
            showPopupNotification("No image found in clipboard", "error");
          }
        })
        .catch(error => {
          console.error('Error accessing clipboard:', error);
          resetUploadUI();
          showPopupNotification("Could not access clipboard: " + error.message, "error");
        });
    });
  }
  
  // Handle file selection
  function handleFileSelect(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        showPopupNotification("Selected file is not an image", "error");
        return;
      }
      
      // Show uploading UI
      showUploadingUI();
      
      // Process and upload the image
      processAndUploadImage(file);
    }
  }
  
  // Handle drag over
  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.add('drag-over');
  }
  
  // Handle drag leave
  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('drag-over');
  }
  
  // Handle drop
  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('drag-over');
    
    // Check if files were dropped
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        showPopupNotification("Dropped file is not an image", "error");
        return;
      }
      
      // Show uploading UI
      showUploadingUI();
      
      // Process and upload the image
      processAndUploadImage(file);
    }
  }
  
  // Update user info in the UI
  function updateUserInfo(userInfo) {
    if (!userInfo) return;
    
    // Use the full name if available, otherwise use the email or a default
    const displayName = userInfo.name || (userInfo.email ? userInfo.email.split('@')[0] : 'Google User');
    
    if (userName) userName.textContent = displayName;
    if (userEmail) userEmail.textContent = userInfo.email || '';
    
    if (userInfo.picture && userAvatar) {
      userAvatar.src = userInfo.picture;
      userAvatar.style.display = 'block';
      userAvatar.textContent = '';
    } else if (userAvatar) {
      // Use the first letter of the name as avatar
      userAvatar.src = '';
      const firstLetter = (displayName || 'U').charAt(0).toUpperCase();
      userAvatar.style.backgroundColor = getColorFromLetter(firstLetter);
      userAvatar.style.color = 'white';
      userAvatar.style.fontWeight = 'bold';
      userAvatar.style.display = 'flex';
      userAvatar.style.justifyContent = 'center';
      userAvatar.style.alignItems = 'center';
      userAvatar.textContent = firstLetter;
    }
    
    // Save this info to storage for future use
    chrome.storage.sync.set({ 
      userName: displayName,
      userEmail: userInfo.email || '',
      userPicture: userInfo.picture || ''
    });
  }
  
  // Generate a color from a letter
  function getColorFromLetter(letter) {
    const colors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
      '#1A73E8', '#D93025', '#F9AB00', '#1E8E3E', // Darker variants
      '#5F6368', '#80868B', '#3C4043', '#202124'  // Gray variants
    ];
    
    const charCode = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
    return colors[Math.abs(charCode) % colors.length];
  }
  
  // Load folders from Google Drive
  function loadFolders(folderId) {
    if (!folderBrowser) return;
    
    // Show loading state
    folderBrowser.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    chrome.runtime.sendMessage({ action: "listFolders", parent: folderId }, (response) => {
      if (response && response.success) {
        displayFolders(response.folders || [], response.files || []);
      } else {
        if (folderBrowser) {
          folderBrowser.innerHTML = '<div style="padding: 15px; text-align: center; color: #5f6368;">Could not load items</div>';
        }
      }
    });
  }
  
  // Display folders in the UI
  function displayFolders(folders, files = []) {
    if (!folderBrowser) return;
    
    folderBrowser.innerHTML = '';
    
    // Always add a special option to select the current folder
    const currentFolderItem = document.createElement('div');
    currentFolderItem.className = 'folder-item';
    
    // Check if this folder is already selected
    chrome.storage.sync.get(['defaultFolder'], (result) => {
      if (result.defaultFolder === currentFolderId) {
        currentFolderItem.classList.add('selected');
      }
    });
    
    currentFolderItem.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Select this folder</span>
    `;
    currentFolderItem.addEventListener('click', () => {
      // Save the current folder as default
      chrome.storage.sync.set({
        defaultFolder: currentFolderId,
        defaultFolderPath: pathHistory
      });
      // Provide visual feedback
      currentFolderItem.classList.add('selected');
      
      // Show message to confirm selection
      showPopupNotification("Folder selected as default", "success");
      
      // Also load previously uploaded images in this folder
      loadPreviousUploads(currentFolderId);
    });
    folderBrowser.appendChild(currentFolderItem);
    
    // Add back option if not at root
    if (currentFolderId !== 'root') {
      const backItem = document.createElement('div');
      backItem.className = 'folder-item';
      backItem.innerHTML = `
        <i class="fas fa-arrow-left"></i>
        <span>Back</span>
      `;
      backItem.addEventListener('click', () => {
        navigateBack();
      });
      folderBrowser.appendChild(backItem);
    }
    
    // Add folders with special folder icon
    if (folders && folders.length > 0) {
      folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `
          <i class="fas fa-folder"></i>
          <span>${folder.name}</span>
        `;
        folderItem.addEventListener('click', () => {
          navigateToFolder(folder.id, folder.name);
        });
        folderBrowser.appendChild(folderItem);
      });
    }
    
    // Add files with appropriate icons
    if (files && files.length > 0) {
      files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'folder-item file-item';
        
        // Determine icon based on mime type
        let iconHtml = '';
        if (file.mimeType && file.mimeType.startsWith('image/')) {
          iconHtml = '<i class="fas fa-file-image" style="color: #4285F4;"></i>';
        } else if (file.mimeType && file.mimeType.startsWith('video/')) {
          iconHtml = '<i class="fas fa-file-video" style="color: #EA4335;"></i>';
        } else if (file.mimeType && file.mimeType.startsWith('audio/')) {
          iconHtml = '<i class="fas fa-file-audio" style="color: #FBBC05;"></i>';
        } else if (file.mimeType && file.mimeType.includes('spreadsheet')) {
          iconHtml = '<i class="fas fa-file-excel" style="color: #0F9D58;"></i>';
        } else if (file.mimeType && file.mimeType.includes('document')) {
          iconHtml = '<i class="fas fa-file-word" style="color: #4285F4;"></i>';
        } else if (file.mimeType && file.mimeType.includes('presentation')) {
          iconHtml = '<i class="fas fa-file-powerpoint" style="color: #F4B400;"></i>';
        } else if (file.mimeType && file.mimeType.includes('pdf')) {
          iconHtml = '<i class="fas fa-file-pdf" style="color: #DB4437;"></i>';
        } else {
          iconHtml = '<i class="fas fa-file"></i>';
        }
        
        fileItem.innerHTML = `
          ${iconHtml}
          <span>${file.name}</span>
        `;
        
        fileItem.addEventListener('click', () => {
          // Copy link to clipboard
          const shareableLink = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
          navigator.clipboard.writeText(shareableLink)
            .then(() => {
              showPopupNotification("Link copied to clipboard", "success");
            })
            .catch(err => {
              showPopupNotification("Could not copy link to clipboard", "error");
            });
        });
        
        folderBrowser.appendChild(fileItem);
      });
    }
    
    // Show message if no folders or files found
    if ((!folders || folders.length === 0) && (!files || files.length === 0)) {
      const noItemsMessage = document.createElement('div');
      noItemsMessage.style.padding = '15px';
      noItemsMessage.style.textAlign = 'center';
      noItemsMessage.style.color = '#5f6368';
      noItemsMessage.textContent = 'No items found';
      folderBrowser.appendChild(noItemsMessage);
    }
    
    // If this is the current default folder, also load previous uploads
    chrome.storage.sync.get(['defaultFolder'], (result) => {
      if (result.defaultFolder === currentFolderId) {
        loadPreviousUploads(currentFolderId);
      }
    });
  }
  
  // Navigate to a folder
  function navigateToFolder(folderId, folderName) {
    currentFolderId = folderId;
    pathHistory.push({ id: folderId, name: folderName });
    updatePathDisplay();
    loadFolders(folderId);
  }
  
  // Navigate back
  function navigateBack() {
    if (pathHistory.length > 1) {
      pathHistory.pop();
      const previousFolder = pathHistory[pathHistory.length - 1];
      currentFolderId = previousFolder.id;
      updatePathDisplay();
      loadFolders(currentFolderId);
    }
  }
  
  // Update the folder path display
  function updatePathDisplay() {
    if (!folderPath) return;
    
    folderPath.innerHTML = '';
    
    pathHistory.forEach((folder, index) => {
      const pathItem = document.createElement('div');
      pathItem.className = 'path-item';
      pathItem.innerHTML = `<span data-id="${folder.id}">${folder.name}</span>`;
      
      // Add click event to navigate to this path
      pathItem.addEventListener('click', () => {
        // Navigate to this folder
        if (index < pathHistory.length - 1) {
          currentFolderId = folder.id;
          pathHistory = pathHistory.slice(0, index + 1);
          updatePathDisplay();
          loadFolders(folder.id);
        }
      });
      
      folderPath.appendChild(pathItem);
    });
  }
  
  // Update path from saved path history
  function updatePathFromSaved(savedPath) {
    if (Array.isArray(savedPath) && savedPath.length > 0) {
      pathHistory = savedPath;
      updatePathDisplay();
    }
  }
  
  // Handle path item click
  function handlePathClick(event) {
    const pathItem = event.target.closest('.path-item');
    if (pathItem) {
      const spanElement = pathItem.querySelector('span');
      if (spanElement && spanElement.dataset.id) {
        const folderId = spanElement.dataset.id;
        // Find the index of this folder in the path history
        const index = pathHistory.findIndex(item => item.id === folderId);
        if (index >= 0) {
          currentFolderId = folderId;
          pathHistory = pathHistory.slice(0, index + 1);
          updatePathDisplay();
          loadFolders(folderId);
        }
      }
    }
  }
  
  // Handle create folder button click
  function handleCreateFolder() {
    if (!newFolderName) return;
    
    const folderName = newFolderName.value.trim();
    if (folderName) {
      // Disable the button and input
      if (createFolderButton) createFolderButton.disabled = true;
      newFolderName.disabled = true;
      
      chrome.runtime.sendMessage(
        { 
          action: "createFolder", 
          name: folderName, 
          parent: currentFolderId 
        }, 
        (response) => {
          // Re-enable the button and input
          if (createFolderButton) createFolderButton.disabled = false;
          newFolderName.disabled = false;
          
          if (response && response.success && response.folder) {
            // Clear the input
            newFolderName.value = '';
            // Reload the folders to show the new one
            loadFolders(currentFolderId);
            // Show success notification
            showPopupNotification("Folder created successfully", "success");
          } else {
            // Show error message
            showPopupNotification("Failed to create folder", "error");
            console.error('Failed to create folder:', response ? response.error : 'Unknown error');
          }
        }
      );
    }
  }
  
  
// Process and upload image
function processAndUploadImage(blob) {
    // Guard against null blob
    if (!blob) {
      console.error('No valid blob to process');
      resetUploadUI();
      showPopupNotification("Error: No valid image data found", "error");
      return;
    }
  
    // Process the image (handle compression if needed) with error handling
    processImage(blob)
      .then(processedImage => {
        if (!processedImage || !processedImage.dataUrl) {
          throw new Error('Failed to process image');
        }
        
        // Generate filename
        return generateFilename(processedImage.type)
          .then(filename => {
            return { 
              imageData: processedImage.dataUrl, 
              filename: filename 
            };
          });
      })
      .then(({ imageData, filename }) => {
        // Get the current folder ID
        const folderId = currentFolderId || 'root';
        
        console.log('Starting upload to folder:', folderId);
        
        // Upload to Google Drive
        chrome.runtime.sendMessage(
          { 
            action: "uploadImage", 
            imageData: imageData, 
            folder: folderId,
            filename: filename
          }, 
          (response) => {
            if (response && response.success) {
              console.log('Upload successful');
              // Show success UI
              showSuccessUI(response.shareableLink, response.fileId);
              // Reload the folder contents to show the new file
              loadFolders(currentFolderId);
            } else {
              // Show error
              console.error('Upload failed:', response ? response.error : 'Unknown error');
              resetUploadUI();
              showPopupNotification("Upload failed: " + (response && response.error ? response.error : "Unknown error"), "error");
            }
          }
        );
      })
      .catch(error => {
        console.error('Error in processing/uploading image:', error);
        resetUploadUI();
        showPopupNotification("Error processing image: " + error.message, "error");
      });
  }
  
  // Show uploading UI
  function showUploadingUI() {
    if (!uploadArea) return;
    
    // Hide the normal upload area content
    uploadArea.innerHTML = `
      <div class="uploading">
        <div class="spinner"></div>
        <p>Uploading...</p>
      </div>
    `;
    
    // Hide the result section if visible
    if (resultSection) resultSection.classList.add('hidden');
  }
  
  // Show success UI
  function showSuccessUI(shareableLink, fileId) {
    if (!uploadArea || !resultSection || !resultLink) return;
    
    // Show success animation in upload area
    uploadArea.innerHTML = `
      <div class="success-animation">
        <i class="fas fa-check"></i>
      </div>
    `;
    
    // Show the result section
    resultSection.classList.remove('hidden');
    
    // Set the link
    resultLink.value = shareableLink;
    
    // Set the view file link
    if (viewFile) {
      viewFile.onclick = () => {
        chrome.tabs.create({ url: shareableLink });
      };
    }
    
    // Automatically copy the link to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        showPopupNotification("Link copied to clipboard", "success");
      })
      .catch(err => {
        console.error('Could not copy link to clipboard:', err);
      });
  }
  
  // Reset upload UI
  function resetUploadUI() {
    if (!uploadArea) return;
    
    // Reset the upload area
    uploadArea.innerHTML = `
      <div class="upload-prompt">
        <i class="fas fa-image"></i>
        <p>Drag and drop an image here<br>or click to select a file</p>
      </div>
    `;
    
    // Hide the result section
    if (resultSection) resultSection.classList.add('hidden');
    
    // Clear the file input
    if (fileInput) fileInput.value = "";
  }
  
  // Handle copy link button
  function handleCopyLink() {
    if (resultLink && resultLink.value) {
      navigator.clipboard.writeText(resultLink.value)
        .then(() => {
          showPopupNotification("Link copied to clipboard", "success");
        })
        .catch(err => {
          showPopupNotification("Could not copy link to clipboard", "error");
        });
    }
  }
  
  // Handle view file button
  function handleViewFile() {
    if (resultLink && resultLink.value) {
      chrome.tabs.create({ url: resultLink.value });
    }
  }
  
  // Load previously uploaded images in the selected folder
  function loadPreviousUploads(folderId) {
    if (!previousUploadsSection || !previousUploadsContainer) return;
    
    previousUploadsSection.classList.remove('hidden');
    previousUploadsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Call the background script to get previous uploads
    chrome.runtime.sendMessage({ 
      action: "listFiles", 
      folderId: folderId,
      fileType: "image" 
    }, (response) => {
      if (response && response.success && response.files && response.files.length > 0) {
        displayPreviousUploads(response.files);
      } else {
        previousUploadsContainer.innerHTML = '<div style="padding: 15px; text-align: center; color: #5f6368;">No previous uploads found</div>';
      }
    });
  }
  
  // Display previously uploaded images
  function displayPreviousUploads(files) {
    if (!previousUploadsContainer) return;
    
    previousUploadsContainer.innerHTML = '';
    
    if (!files || files.length === 0) {
      previousUploadsContainer.innerHTML = '<div style="padding: 15px; text-align: center; color: #5f6368;">No previous uploads found</div>';
      return;
    }
    
    // Sort files by creation time (newest first)
    files.sort((a, b) => {
      if (!a.createdTime) return 1;
      if (!b.createdTime) return -1;
      return new Date(b.createdTime) - new Date(a.createdTime);
    });
    
    // Show only the 10 most recent uploads
    const recentFiles = files.slice(0, 10);
    
    recentFiles.forEach(file => {
      const uploadItem = document.createElement('div');
      uploadItem.className = 'previous-upload-item';
      
      // Format the date
      let formattedDate = 'Unknown date';
      if (file.createdTime) {
        const fileDate = new Date(file.createdTime);
        formattedDate = fileDate.toLocaleDateString() + ' ' + fileDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Create thumbnail or icon
      let thumbnailContent = '';
      if (file.thumbnailLink) {
        thumbnailContent = `<img src="${file.thumbnailLink}" alt="${file.name}">`;
      } else {
        thumbnailContent = `<i class="fas fa-file-image"></i>`;
      }
      
      uploadItem.innerHTML = `
        <div class="previous-upload-thumbnail">
          ${thumbnailContent}
        </div>
        <div class="previous-upload-details">
          <div class="previous-upload-name" title="${file.name}">${file.name}</div>
          <div class="previous-upload-date">${formattedDate}</div>
        </div>
        <div class="previous-upload-actions">
          <button class="copy-link-btn" data-link="${file.webViewLink || `https://drive.google.com/file/d/${file.id}/view?usp=sharing`}">
            Copy
          </button>
          <button class="view-file-btn" data-link="${file.webViewLink || `https://drive.google.com/file/d/${file.id}/view?usp=sharing`}">
            View
          </button>
        </div>
      `;
      
      // Add event listeners for the buttons
      const copyBtn = uploadItem.querySelector('.copy-link-btn');
      const viewBtn = uploadItem.querySelector('.view-file-btn');
      
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          const link = e.target.dataset.link;
          if (link) {
            navigator.clipboard.writeText(link)
              .then(() => {
                showPopupNotification("Link copied to clipboard", "success");
              })
              .catch(err => {
                showPopupNotification("Could not copy link to clipboard", "error");
              });
          }
        });
      }
      
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          const link = e.target.dataset.link;
          if (link) {
            chrome.tabs.create({ url: link });
          }
        });
      }
      
      previousUploadsContainer.appendChild(uploadItem);
    });
    
    // If there are more files than we're showing
    if (files.length > 10) {
      const moreItem = document.createElement('div');
      moreItem.className = 'previous-upload-item';
      moreItem.style.justifyContent = 'center';
      moreItem.style.color = '#4285F4';
      moreItem.style.cursor = 'pointer';
      moreItem.innerHTML = `<span>View all ${files.length} images in Drive</span>`;
      
      moreItem.addEventListener('click', () => {
        chrome.tabs.create({ url: `https://drive.google.com/drive/folders/${currentFolderId}` });
      });
      
      previousUploadsContainer.appendChild(moreItem);
    }
  }