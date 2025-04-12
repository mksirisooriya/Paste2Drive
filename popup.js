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

// Current state
let currentFolderId = 'root';
let pathHistory = [{ id: 'root', name: 'My Drive' }];

// Event listeners
document.addEventListener('DOMContentLoaded', initializePopup);
loginButton.addEventListener('click', handleLogin);
changeAccountButton.addEventListener('click', handleChangeAccount);
createFolderButton.addEventListener('click', handleCreateFolder);
folderPath.addEventListener('click', handlePathClick);
openSettings.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
uploadClipboard.addEventListener('click', handleUploadFromClipboard);
uploadArea.addEventListener('click', () => document.getElementById('file-input').click());
copyLink.addEventListener('click', handleCopyLink);
viewFile.addEventListener('click', handleViewFile);
newUpload.addEventListener('click', resetUploadUI);

// Add file input element
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'file-input';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);
fileInput.addEventListener('change', handleFileSelect);

// Add drag and drop listeners
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

// Initialize popup
function initializePopup() {
  showView(loadingView);
  
  // Check if user is authenticated
  chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
    if (response && response.isAuthenticated && response.userInfo) {
      // User is authenticated
      updateUserInfo(response.userInfo);
      showView(mainView);
      loadFolders(currentFolderId);
      
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
      // User is not authenticated
      showView(loginView);
    }
  });
}

// Show specified view and hide others
function showView(viewToShow) {
  loginView.classList.add('hidden');
  mainView.classList.add('hidden');
  loadingView.classList.add('hidden');
  
  viewToShow.classList.remove('hidden');
}

// Handle login button click
function handleLogin() {
  showView(loadingView);
  
  chrome.runtime.sendMessage({ action: "authenticate" }, (response) => {
    if (response && response.success && response.userInfo) {
      updateUserInfo(response.userInfo);
      showView(mainView);
      loadFolders('root');
    } else {
      showView(loginView);
      // Could show an error message here
    }
  });
}

// Handle change account button click
function handleChangeAccount() {
  showView(loadingView);
  
  chrome.runtime.sendMessage({ action: "changeAccount" }, (response) => {
    if (response && response.success && response.userInfo) {
      updateUserInfo(response.userInfo);
      // Reset to root folder
      currentFolderId = 'root';
      pathHistory = [{ id: 'root', name: 'My Drive' }];
      updatePathDisplay();
      loadFolders('root');
      showView(mainView);
    } else {
      showView(loginView);
      // Could show an error message here
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

// Process and upload image
function processAndUploadImage(blob) {
  // Process the image (handle compression if needed)
  processImage(blob)
    .then(processedImage => {
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
            // Show success UI
            showSuccessUI(response.shareableLink, response.fileId);
          } else {
            // Show error
            resetUploadUI();
            showPopupNotification("Upload failed: " + (response && response.error ? response.error : "Unknown error"), "error");
          }
        }
      );
    })
    .catch(error => {
      console.error('Error processing image:', error);
      resetUploadUI();
      showPopupNotification("Error processing image", "error");
    });
}

// Show uploading UI
function showUploadingUI() {
  // Hide the normal upload area content
  uploadArea.innerHTML = `
    <div class="uploading">
      <div class="spinner"></div>
      <p>Uploading...</p>
    </div>
  `;
  
  // Hide the result section if visible
  resultSection.classList.add('hidden');
}

// Show success UI
function showSuccessUI(shareableLink, fileId) {
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
  viewFile.onclick = () => {
    chrome.tabs.create({ url: shareableLink });
  };
  
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
  // Reset the upload area
  uploadArea.innerHTML = `
    <div class="upload-prompt">
      <i class="fas fa-image"></i>
      <p>Drag and drop an image here<br>or</p>
    </div>
  `;
  
  // Hide the result section
  resultSection.classList.add('hidden');
  
  // Clear the file input
  fileInput.value = "";
}

// Handle copy link button
function handleCopyLink() {
  if (resultLink.value) {
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
  if (resultLink.value) {
    chrome.tabs.create({ url: resultLink.value });
  }
}

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

// Update user info in the UI
function updateUserInfo(userInfo) {
  userName.textContent = userInfo.name || 'Google User';
  userEmail.textContent = userInfo.email || '';
  
  if (userInfo.picture) {
    userAvatar.src = userInfo.picture;
  } else {
    // Use the first letter of the name as avatar
    userAvatar.src = '';
    const firstLetter = (userInfo.name || 'U').charAt(0).toUpperCase();
    userAvatar.style.backgroundColor = getColorFromLetter(firstLetter);
    userAvatar.style.color = 'white';
    userAvatar.style.fontWeight = 'bold';
    userAvatar.style.display = 'flex';
    userAvatar.style.justifyContent = 'center';
    userAvatar.style.alignItems = 'center';
    userAvatar.textContent = firstLetter;
  }
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
  // Show loading state
  folderBrowser.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  chrome.runtime.sendMessage({ action: "listFolders", parent: folderId }, (response) => {
    if (response && response.success && response.folders) {
      displayFolders(response.folders);
    } else {
      folderBrowser.innerHTML = '<div style="padding: 15px; text-align: center; color: #5f6368;">Could not load folders</div>';
    }
  });
}

// Display folders in the UI
function displayFolders(folders) {
  folderBrowser.innerHTML = '';
  
  // Always add a special option to select the current folder
  const currentFolderItem = document.createElement('div');
  currentFolderItem.className = 'folder-item';
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
    setTimeout(() => {
      currentFolderItem.classList.remove('selected');
    }, 500);
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
  
  // Show message if no folders
  if (folders.length === 0) {
    const noFolders = document.createElement('div');
    noFolders.style.padding = '15px';
    noFolders.style.textAlign = 'center';
    noFolders.style.color = '#5f6368';
    noFolders.textContent = 'No folders found';
    folderBrowser.appendChild(noFolders);
    return;
  }
  
  // Add folders
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
  folderPath.innerHTML = '';
  
  pathHistory.forEach((folder, index) => {
    const pathItem = document.createElement('div');
    pathItem.className = 'path-item';
    pathItem.innerHTML = `<span data-id="${folder.id}">${folder.name}</span>`;
    folderPath.appendChild(pathItem);
    
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
    const folderId = pathItem.querySelector('span').dataset.id;
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

// Handle create folder button click
function handleCreateFolder() {
  const folderName = newFolderName.value.trim();
  if (folderName) {
    // Disable the button and input
    createFolderButton.disabled = true;
    newFolderName.disabled = true;
    
    chrome.runtime.sendMessage(
      { 
        action: "createFolder", 
        name: folderName, 
        parent: currentFolderId 
      }, 
      (response) => {
        // Re-enable the button and input
        createFolderButton.disabled = false;
        newFolderName.disabled = false;
        
        if (response && response.success && response.folder) {
          // Clear the input
          newFolderName.value = '';
          // Reload the folders to show the new one
          loadFolders(currentFolderId);
        } else {
          // Could show an error message here
          console.error('Failed to create folder:', response ? response.error : 'Unknown error');
        }
      }
    );
  }
}