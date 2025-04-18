# Paste2Drive

A Chrome extension that makes it easy to upload clipboard images to Google Drive and insert shareable links in Google Workspace products.

<p align="center">
  <img src="images/icon- readme.png" alt="Paste2Drive Logo" width="128">
</p>

## Features

- Upload clipboard images directly to Google Drive with a simple click
- Automatically create shareable links for uploaded images
- Choose where to save your images in Google Drive
- Navigate through your Drive folders
- Create new folders directly from the extension
- Switch between Google accounts
- Works with Google Docs, Sheets, and Slides
- Drag and drop image uploads
- View and reuse previous uploads

## Installation

### Chrome Web Store (Recommended)

1. Visit the [Paste2Drive page on the Chrome Web Store](https://chrome.google.com/webstore/detail/paste2drive/[YOUR-EXTENSION-ID])
2. Click "Add to Chrome" to install the extension
3. Click on the Paste2Drive icon in your extensions toolbar to set up your Google Drive connection

### Manual Installation for Developers

1. Clone this repository: `git clone https://github.com/mksirisooriya/Paste2Drive.git`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top right
4. Click "Load unpacked" and select the folder containing the extension files
5. Configure your own OAuth credentials as described in the "Development Setup" section

## Usage

### Quick Upload (From Extension Popup)

1. Copy an image to your clipboard (e.g., using Print Screen or Ctrl+C)
2. Click the Paste2Drive icon in your browser toolbar
3. Click the "Upload Clipboard" button
4. The image will be uploaded to your selected Google Drive folder, and the link will be copied to your clipboard

### Upload with Context Menu

1. Copy an image to your clipboard
2. Right-click in any editable area in a Google Workspace app
3. Select "Upload to Drive" from the context menu
4. The image will be uploaded and a link will be inserted

### Drag and Drop Upload

1. Click the Paste2Drive icon in your browser toolbar
2. Drag and drop an image file directly onto the upload area
3. The image will be uploaded to your selected folder and the link will be copied to your clipboard

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
2. Click the "Settings" button
3. Customize upload settings, link formats, and notification preferences

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

Paste2Drive only accesses your clipboard when you explicitly trigger an upload using the extension popup or context menu. Your Google Drive access is limited to folders and file operations needed for the extension to function. See our [Privacy Policy](PRIVACY-POLICY.md) for more details.

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
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
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

1. Make sure you have 7-Zip installed and available in your PATH, or use PowerShell
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

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Note

This extension includes a client ID in the manifest.json file as required by Chrome for OAuth authentication. This practice is standard for Chrome extensions using Google OAuth and is not a security concern as the extension also implements the proper authentication flow.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Drive API](https://developers.google.com/drive)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Font Awesome](https://fontawesome.com/) for icons