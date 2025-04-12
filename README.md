# Paste2Drive

A Chrome extension that makes it easy to upload clipboard images to Google Drive and insert shareable links in Google Workspace products.

![Paste2Drive Logo](images/icon128.png)

## Features

- Upload clipboard images directly to Google Drive with a single keyboard shortcut
- Automatically create shareable links for uploaded images
- Choose where to save your images in Google Drive
- Navigate through your Drive folders
- Create new folders directly from the extension
- Switch between Google accounts
- Works with Google Docs, Sheets, and Slides

## Installation

### For Users

1. Download the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/paste2drive/your-extension-id)
2. Click "Add to Chrome" to install the extension
3. Click on the Paste2Drive icon in your extensions toolbar to set up your Google Drive connection

### For Developers

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top right
4. Click "Load unpacked" and select the folder containing the extension files
5. Configure your OAuth credentials as described in the "Development Setup" section

## Usage

### Quick Upload (Keyboard Shortcut)

1. Copy an image to your clipboard (e.g., using Print Screen or Ctrl+C)
2. In a Google Workspace app (Docs, Sheets, or Slides), press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)
3. The image will be uploaded to your selected Google Drive folder, and a shareable link will be pasted at your cursor position

### Manual Upload (Context Menu)

1. Copy an image to your clipboard
2. Right-click in any editable area in a Google Workspace app
3. Select "Upload to Drive" from the context menu
4. The image will be uploaded and a link will be inserted

### Setting a Default Folder

1. Click the Paste2Drive icon in your browser's extension toolbar
2. Navigate through your Google Drive folders
3. Click "Select this folder" to set the current folder as your default upload location

### Creating New Folders

1. Open the extension popup
2. Navigate to the parent folder where you want to create a new folder
3. Enter a name in the "New folder name" field
4. Click "Create"

### Changing Google Accounts

1. Open the extension popup
2. Click the "Change" button next to your account info
3. Follow the Google authentication flow to switch accounts

### Configuring Options

1. Click the Paste2Drive icon in your toolbar
2. Click the "Settings" button, or
3. Go to `chrome://extensions/`, find Paste2Drive, and click "Extension options"
4. Customize upload settings, link formats, and notification preferences

## Permissions

This extension requires the following permissions:

- **clipboardRead**: To access image data from your clipboard
- **clipboardWrite**: To copy formatted links to your clipboard
- **storage**: To save your preferences and settings
- **identity**: To authenticate with your Google account
- **contextMenus**: To add the "Upload to Drive" option to context menus
- **notifications**: To display status notifications

It also needs access to Google Workspace sites to function properly.

## Privacy

Paste2Drive only accesses your clipboard when you explicitly trigger an upload using the keyboard shortcut or context menu. Your Google Drive access is limited to folders and file operations needed for the extension to function. See our [Privacy Policy](PRIVACY-POLICY.md) for more details.

## Development Setup

To develop or modify this extension, you'll need to:

1. Create a Google Cloud Platform project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Update the manifest.json file with your credentials

### Creating OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen (External or Internal type)
5. Add the necessary scopes:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/drive.file`
6. Navigate to "APIs & Services" > "Credentials"
7. Click "Create Credentials" > "OAuth client ID"
8. Choose "Chrome App" as the application type
9. Enter your extension ID and name
10. Copy the client ID and update it in the manifest.json file

### Important Files

- `manifest.json`: Extension configuration and permissions
- `background.js`: Background service worker handling authentication and Google Drive operations
- `content.js`: Content script for interacting with Google Workspace pages
- `popup.html` and `popup.js`: User interface for the extension popup
- `options.html` and `options.js`: Settings page
- `utility.js`: Shared utility functions

## Building for Distribution

To build the extension for distribution:

1. Make sure you have 7-Zip installed and available in your PATH
2. Run the included build script:
   ```
   build.bat
   ```
3. The packaged extension will be created in the `build` directory

## Troubleshooting

### Authentication Issues

- Make sure you've authorized the extension to access your Google Drive
- If you're having trouble switching accounts, try signing out of Google in your browser first
- Check that your OAuth credentials are correctly configured in manifest.json

### Upload Problems

- Verify that the image is properly copied to your clipboard
- Check that you have sufficient permissions in the target Google Drive folder
- Ensure you're using the extension in a supported Google Workspace app

### Extension Doesn't Appear

- Make sure the extension is enabled in Chrome's extensions page
- Try reloading the Google Workspace page
- If using a managed Chrome profile, check with your administrator about extension permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or create an Issue to report bugs or suggest features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.