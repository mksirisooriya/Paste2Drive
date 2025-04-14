// Options page script for Paste2Drive extension

// DOM elements
const autoUpload = document.getElementById('autoUpload');
const fileNaming = document.getElementById('fileNaming');
const customPrefixRow = document.getElementById('customPrefixRow');
const customPrefix = document.getElementById('customPrefix');
const imageQuality = document.getElementById('imageQuality');
const linkFormat = document.getElementById('linkFormat');
const linkTextRow = document.getElementById('linkTextRow');
const linkText = document.getElementById('linkText');
const copyLinkToClipboard = document.getElementById('copyLinkToClipboard');
const showNotifications = document.getElementById('showNotifications');
const notificationDuration = document.getElementById('notificationDuration');
const clearAuth = document.getElementById('clearAuth');
const resetSettings = document.getElementById('resetSettings');
const saveSettings = document.getElementById('saveSettings');
const status = document.getElementById('status');

// Default settings
const defaultSettings = {
  autoUpload: true,
  fileNaming: 'timestamp',
  customPrefix: 'image_',
  imageQuality: 'original',
  linkFormat: 'direct',
  linkText: 'Image Link',
  copyLinkToClipboard: true,
  showNotifications: true,
  notificationDuration: 3
};

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings);

// Event listeners
fileNaming.addEventListener('change', toggleCustomPrefix);
linkFormat.addEventListener('change', toggleLinkText);
saveSettings.addEventListener('click', saveOptions);
clearAuth.addEventListener('click', clearAuthorization);
resetSettings.addEventListener('click', resetAllSettings);

// Toggle display of custom prefix input
function toggleCustomPrefix() {
  customPrefixRow.style.display = fileNaming.value === 'custom' ? 'flex' : 'none';
}

// Toggle display of link text input
function toggleLinkText() {
  linkTextRow.style.display = linkFormat.value !== 'direct' ? 'flex' : 'none';
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (items) => {
    autoUpload.checked = items.autoUpload;
    fileNaming.value = items.fileNaming;
    customPrefix.value = items.customPrefix;
    imageQuality.value = items.imageQuality;
    linkFormat.value = items.linkFormat;
    linkText.value = items.linkText;
    copyLinkToClipboard.checked = items.copyLinkToClipboard;
    showNotifications.checked = items.showNotifications;
    notificationDuration.value = items.notificationDuration;
    
    // Show/hide conditional inputs
    toggleCustomPrefix();
    toggleLinkText();
  });
}

// Save options to chrome.storage
function saveOptions() {
  const settings = {
    autoUpload: autoUpload.checked,
    fileNaming: fileNaming.value,
    customPrefix: customPrefix.value,
    imageQuality: imageQuality.value,
    linkFormat: linkFormat.value,
    linkText: linkText.value,
    copyLinkToClipboard: copyLinkToClipboard.checked,
    showNotifications: showNotifications.checked,
    notificationDuration: parseInt(notificationDuration.value, 10) || 3
  };
  
  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');
  });
}

// Clear Google authorization
function clearAuthorization() {
  if (confirm('Are you sure you want to revoke access to your Google account? You will need to re-authenticate to use the extension.')) {
    clearAuth.disabled = true;
    showStatus('Clearing authorization...', 'info');
    
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // Remove token from Chrome's cache
        chrome.identity.removeCachedAuthToken({ token }, () => {
          // Revoke token on server
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            .then(() => {
              // Clear stored account data
              chrome.storage.sync.remove(['activeAccount', 'userName', 'userEmail', 'userPicture'], () => {
                showStatus('Google authorization cleared', 'success');
                clearAuth.disabled = false;
              });
            })
            .catch(error => {
              console.error('Error revoking token:', error);
              showStatus('Error clearing authorization: ' + error.message, 'error');
              clearAuth.disabled = false;
            });
        });
      } else {
        showStatus('No active authorization found', 'error');
        clearAuth.disabled = false;
      }
    });
  }
}

// Reset all settings to defaults
function resetAllSettings() {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings();
      showStatus('Settings reset to defaults', 'success');
    });
  }
}

// Show status message
function showStatus(message, type = 'success') {
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.opacity = '1';
  
  setTimeout(() => {
    status.style.opacity = '0';
  }, 3000);
}

// Enhanced handler for change account button click
function handleChangeAccount() {
    showView(loadingView);
    
    chrome.runtime.sendMessage({ action: "changeAccount" }, (response) => {
      if (response && response.success) {
        if (response.status === 'account_selection_started') {
          // Account selection has started in a separate tab
          // Show a message to the user in the popup
          showView(loginView);
          
          // Create a message element if it doesn't exist
          let messageElement = document.querySelector('.account-selection-message');
          if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'account-selection-message';
            messageElement.style.marginTop = '20px';
            messageElement.style.padding = '10px';
            messageElement.style.backgroundColor = '#e8f0fe';
            messageElement.style.color = '#1967d2';
            messageElement.style.borderRadius = '4px';
            messageElement.style.fontSize = '13px';
            messageElement.style.textAlign = 'center';
            
            const loginPrompt = document.querySelector('.login-prompt');
            if (loginPrompt) {
              loginPrompt.appendChild(messageElement);
            }
          }
          
          // Set the message text
          messageElement.textContent = response.message || 'Please select or switch to your desired Google account, then click "Sign in" again.';
        } else if (response.userInfo) {
          // User info was returned, update the UI
          updateUserInfo(response.userInfo);
          
          // Reset to root folder if account changed
          currentFolderId = 'root';
          pathHistory = [{ id: 'root', name: 'My Drive' }];
          updatePathDisplay();
          loadFolders('root');
          
          showView(mainView);
        }
      } else {
        // Error handling
        showView(loginView);
        if (response && response.error) {
          showLoginError(response.error);
        } else {
          showLoginError("Failed to change account. Please try again.");
        }
      }
    });
  }