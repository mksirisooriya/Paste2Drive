// Background script for Paste2Drive extension

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items
    chrome.contextMenus.create({
      id: "paste2drive",
      title: "Upload to Drive",
      contexts: ["editable"]
    });
  
    // Set default settings
    chrome.storage.sync.get(['defaultFolder', 'activeAccount'], (result) => {
      if (!result.defaultFolder) {
        chrome.storage.sync.set({ defaultFolder: 'root' });
      }
      if (!result.activeAccount) {
        // Will prompt for account selection on first use
        chrome.storage.sync.set({ activeAccount: null });
      }
    });
  });
  
  // Listen for context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "paste2drive") {
      chrome.tabs.sendMessage(tab.id, { action: "uploadClipboardImage" });
    }
  });
  
  // Handle messages from content scripts and popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkAuth") {
      checkAuthAndGetUserInfo(sendResponse);
      return true; // Required for async sendResponse
    } 
    else if (message.action === "authenticate") {
      authenticate(sendResponse);
      return true;
    }
    else if (message.action === "changeAccount") {
      changeAccount(sendResponse);
      return true;
    }
    else if (message.action === "uploadImage") {
      uploadImageToDrive(message.imageData, message.folder, message.filename, sendResponse);
      return true;
    }
    else if (message.action === "listFolders") {
      listDriveFolders(message.parent || 'root', sendResponse);
      return true;
    }
    else if (message.action === "listFiles") {
      listDriveFiles(message.folderId, message.fileType, sendResponse);
      return true;
    }
    else if (message.action === "createFolder") {
      createDriveFolder(message.name, message.parent || 'root', sendResponse);
      return true;
    }
    else if (message.action === "openPopup") {
      // Open the popup
      chrome.action.openPopup();
      sendResponse({ success: true });
      return true;
    }
  });
  
  // Check if user is authenticated and get user info
  function checkAuthAndGetUserInfo(sendResponse) {
    console.log('Checking authentication status...');
    
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Auth token error:', chrome.runtime.lastError);
        sendResponse({ isAuthenticated: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      if (!token) {
        console.log('No token available, user not authenticated');
        sendResponse({ isAuthenticated: false });
        return;
      }
      
      console.log('Token available, fetching user info');
      
      // Get user info
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (!response.ok) {
          console.error('User info response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('User info received:', data);
        chrome.storage.sync.set({ 
          activeAccount: data.email,
          userName: data.name || data.email.split('@')[0],
          userPicture: data.picture || ''
        });
        sendResponse({ isAuthenticated: true, userInfo: data });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        
        // Token might be invalid, try to refresh it
        chrome.identity.removeCachedAuthToken({ token }, () => {
          sendResponse({ isAuthenticated: false, error: error.message });
        });
      });
    });
  }
  
  // Authenticate user (interactive)
  function authenticate(sendResponse) {
    console.log('Starting authentication process...');
    
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Authentication error:', chrome.runtime.lastError);
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message || "Authentication failed" 
        });
        return;
      }
      
      if (!token) {
        console.error('No token received');
        sendResponse({ success: false, error: "No authentication token received" });
        return;
      }
      
      console.log('Token received, fetching user info...');
      
      // Get user info after authentication
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (!response.ok) {
          console.error('User info response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('User info received:', data);
        
        // Store the user info in storage
        chrome.storage.sync.set({ 
          activeAccount: data.email,
          userName: data.name || data.email.split('@')[0],
          userPicture: data.picture || ''
        });
        
        sendResponse({ success: true, userInfo: data });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        
        // Try to get more details if possible
        if (error.response) {
          error.response.text().then(text => {
            console.error('Response details:', text);
          }).catch(err => {
            console.error('Could not get response text:', err);
          });
        }
        
        sendResponse({ success: false, error: error.message });
      });
    });
  }
  
  // Change Google account
  function changeAccount(sendResponse) {
    console.log('Changing account...');
    
    // First revoke current token
    chrome.identity.getAuthToken({ interactive: false }, (currentToken) => {
      if (currentToken) {
        chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
          // Revoke token on server
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${currentToken}`)
            .then(() => {
              console.log('Previous token revoked, getting new one');
              // Now authenticate with a new account
              chrome.identity.getAuthToken({ interactive: true }, (newToken) => {
                if (chrome.runtime.lastError || !newToken) {
                  console.error('Error getting new token:', chrome.runtime.lastError);
                  sendResponse({ success: false, error: chrome.runtime.lastError ? chrome.runtime.lastError.message : "Authentication failed" });
                  return;
                }
                
                // Get new user info
                fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: { Authorization: `Bearer ${newToken}` }
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`User info fetch failed: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  chrome.storage.sync.set({ 
                    activeAccount: data.email,
                    userName: data.name || data.email.split('@')[0],
                    userPicture: data.picture || ''
                  });
                  sendResponse({ success: true, userInfo: data });
                })
                .catch(error => {
                  console.error('Error fetching user info:', error);
                  sendResponse({ success: false, error: error.message });
                });
              });
            })
            .catch(error => {
              console.error('Error revoking token:', error);
              sendResponse({ success: false, error: error.message });
            });
        });
      } else {
        // No current token, just authenticate
        authenticate(sendResponse);
      }
    });
  }
  
  // Upload image to Google Drive
  function uploadImageToDrive(imageData, folderId, filename, sendResponse) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: 'Not authenticated' });
        return;
      }
  
      // Convert base64 image data to a Blob
      const byteString = atob(imageData.split(',')[1]);
      const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
      
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      
      // Create a multipart form request
      const metadata = {
        name: filename || `image_${new Date().getTime()}.png`,
        mimeType: mimeString,
        parents: [folderId]
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);
      
      // Upload the file
      fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          // Make the file shareable with link
          return fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: 'reader',
              type: 'anyone'
            })
          }).then(() => data);
        }
        return data;
      })
      .then(data => {
        if (data.id) {
          // Use the webViewLink if available, otherwise generate one
          const shareableLink = data.webViewLink || `https://drive.google.com/file/d/${data.id}/view?usp=sharing`;
          sendResponse({ 
            success: true, 
            fileId: data.id, 
            fileName: data.name,
            shareableLink 
          });
        } else {
          sendResponse({ success: false, error: 'Upload failed' });
        }
      })
      .catch(error => {
        console.error('Error uploading to Drive:', error);
        sendResponse({ success: false, error: error.message });
      });
    });
  }
  
  // List folders in Google Drive
  function listDriveFolders(parentId, sendResponse) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: 'Not authenticated' });
        return;
      }
      
      // First, get folder items
      const folderQuery = parentId === 'root' 
        ? 'mimeType="application/vnd.google-apps.folder" and "root" in parents and trashed=false'
        : `mimeType="application/vnd.google-apps.folder" and "${parentId}" in parents and trashed=false`;
        
      fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(folderData => {
        // Now, get file items (non-folders)
        const fileQuery = parentId === 'root'
          ? 'mimeType!="application/vnd.google-apps.folder" and "root" in parents and trashed=false'
          : `mimeType!="application/vnd.google-apps.folder" and "${parentId}" in parents and trashed=false`;
          
        return fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name,mimeType,iconLink,thumbnailLink,webViewLink)`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(fileData => {
          // Combine folder and file data and send response
          sendResponse({ 
            success: true, 
            folders: folderData.files || [],
            files: fileData.files || [] 
          });
        });
      })
      .catch(error => {
        console.error('Error listing folders and files:', error);
        sendResponse({ success: false, error: error.message });
      });
    });
  }
  
  // List files in a Google Drive folder
  function listDriveFiles(folderId, fileType, sendResponse) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: 'Not authenticated' });
        return;
      }
      
      // Build query based on folder ID and file type
      let query = `"${folderId}" in parents and trashed=false`;
      
      // Add file type filter if specified
      if (fileType === 'image') {
        query += ` and (mimeType contains 'image/')`;
      }
      
      // Request fields we need for display
      const fields = 'files(id,name,mimeType,webViewLink,thumbnailLink,createdTime)';
      
      fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(data => {
        if (data.files) {
          sendResponse({ success: true, files: data.files });
        } else {
          sendResponse({ success: false, error: 'No files found' });
        }
      })
      .catch(error => {
        console.error('Error listing files:', error);
        sendResponse({ success: false, error: error.message });
      });
    });
  }
  
  // Create a new folder in Google Drive
  function createDriveFolder(name, parentId, sendResponse) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ success: false, error: 'Not authenticated' });
        return;
      }
      
      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };
      
      fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          sendResponse({ success: true, folder: { id: data.id, name: data.name } });
        } else {
          sendResponse({ success: false, error: 'Folder creation failed' });
        }
      })
      .catch(error => {
        console.error('Error creating folder:', error);
        sendResponse({ success: false, error: error.message });
      });
    });
  }