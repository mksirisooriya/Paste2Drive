# Privacy Policy for Paste2Drive

Last Updated: April 18, 2025

## Introduction

This Privacy Policy explains how Paste2Drive ("we", "us", or "our") collects, uses, and shares information when you use our Chrome Extension ("Extension"). We are committed to protecting your privacy and personal information.

## Information We Collect

### Information You Provide

- **Google Account Information**: When you authenticate with Google, we receive basic profile information including your name, email address, and profile picture.
- **Google Drive Access**: The extension accesses your Google Drive to upload images and create folders.

### Information Collected Automatically

- **Clipboard Data**: When you use the extension's functionality, it reads image data from your clipboard, but only when you explicitly trigger this action using the extension popup or context menu option.

### Storage

- **Extension Storage**: We store your preferences (like your default folder selection) locally in Chrome's extension storage. This data remains on your device and is not transmitted to any external servers.

## How We Use Your Information

We use the information we collect to:

- Provide the core functionality of the Extension
- Enable you to upload images to your Google Drive
- Generate shareable links for uploaded images
- Store your preferences locally to remember your selected default folder and settings

## Data Protection Mechanisms

We implement the following safeguards to protect your sensitive data:

- **OAuth Authentication**: We use Google's official OAuth 2.0 protocol to authenticate users, ensuring secure access without exposing your Google credentials. We never see or store your Google password.

- **Local Processing**: All image processing occurs locally within your browser before upload to Google Drive. Your clipboard images never reach our servers.

- **Secure API Communication**: All communication between the extension and Google APIs is conducted using HTTPS with industry-standard TLS encryption.

- **No External Servers**: Paste2Drive operates as a client-side extension that communicates directly with Google's APIs. We do not route your data through any third-party servers, and we do not maintain any servers that store or process your data.

- **Minimal Scope Access**: We request only the permissions required for the extension to function properly. The `drive.readonly` scope is used only to allow you to navigate your folder structure and view previously uploaded files, while file creation is handled with minimal permissions.

- **Secure Storage**: Your preferences and settings are stored exclusively in Chrome's secure extension storage API, which encrypts the data at rest.

- **Extension Security Isolation**: We benefit from Chrome's extension security model, which isolates extension contexts from webpage contexts, providing protection against common web vulnerabilities like cross-site scripting. Our extension follows Chrome's best practices for secure extension development.

- **No Background Data Collection**: The extension only accesses your clipboard data when you explicitly initiate an upload action, and never in the background.

## Data Retention and Deletion

- **Google Account Information**: While we receive basic profile information (name, email, profile picture) during authentication, this information is only stored locally in your browser's secure storage. We do not transfer this information to any external servers, and it is only used to display your account information within the extension.

- **Clipboard Data**: Images from your clipboard are processed locally and immediately uploaded to your Google Drive. We do not retain copies of your clipboard data after upload.

- **Local Storage**: Your preferences, settings, and selected folder information are stored only in your browser's local storage and will be automatically removed when you uninstall the extension.

- **Uploaded Content**: Images you upload through Paste2Drive are stored exclusively in your Google Drive account under your control. They are not stored anywhere else or retained by us in any form.

- **Data Deletion**: You can delete your data in the following ways:
  - Uninstall the extension to remove all locally stored preferences and settings
  - Revoke the extension's access to your Google account at any time through [Google Account Security Settings](https://myaccount.google.com/permissions)
  - Delete any files uploaded to your Google Drive through Google Drive's interface
  - Use the "Clear Google authorization" option in the extension's settings to revoke access and clear stored account data

- **Data Retention Period**: We do not retain any of your data outside of your browser. All Google user data accessed by the extension is only held temporarily in memory during active use of the extension and is discarded when the extension popup is closed or when you navigate away.

- **No Backups**: We do not create or maintain backups of your data, as all data is stored either in your browser or in your Google Drive account.

- **Automated Deletion**: If you haven't used the extension for 90 days, any cached authentication tokens will be automatically invalidated, requiring re-authentication upon next use.

## Data Sharing and Disclosure

We do not sell, trade, or otherwise transfer your personal information to outside parties. Your information is only shared with Google's services when you explicitly use the Extension to upload files to Google Drive.

## Third-Party Services

This Extension interacts with Google services, particularly Google Drive. When you use our Extension, you are also subject to Google's Privacy Policy. We encourage you to review Google's privacy practices:

- [Google Privacy Policy](https://policies.google.com/privacy)

## Your Rights and Choices

You can control your data in the following ways:

- **Google Account Access**: You can revoke the Extension's access to your Google account at any time by visiting [Google Account Security Settings](https://myaccount.google.com/permissions).
- **Extension Permissions**: You can review and modify the Extension's permissions in Chrome's extension settings.
- **Uninstallation**: You can uninstall the Extension at any time, which will remove all locally stored preferences.

## Data Security

The Extension is designed to interact directly between your browser and Google's services. No data is sent to or stored on our servers. All preference data is stored locally in your browser using Chrome's secure storage API.

## Children's Privacy

The Extension is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our GitHub repository and updating the "Last Updated" date at the top of this Privacy Policy.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- Email: bizvorpal+support@gmail.com
- GitHub: https://github.com/mksirisooriya/Paste2Drive/issues

## Consent

By using our Extension, you consent to our Privacy Policy and agree to its terms.