# Privacy Policy for Paste2Drive

Last Updated: June 22, 2025

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

## Sensitive Data Protection Mechanisms

We implement comprehensive security measures specifically designed to protect sensitive Google user data, including:

### Authentication and Access Protection

- **OAuth 2.0 Authentication**: We use Google's official OAuth 2.0 protocol with industry-standard security measures to authenticate users. Your Google credentials are never exposed to our extension - authentication is handled entirely by Google's secure servers.

- **Token-Based Security**: Access to your Google Drive data is controlled through secure, time-limited OAuth tokens that are automatically managed by Chrome's identity API. These tokens can be revoked at any time through your Google Account settings.

- **Minimal Permission Scope**: We request only the minimum necessary permissions (drive.readonly and drive.file) required for core functionality. We do not request access to other Google services or broad account permissions.

### Data Transmission Security

- **HTTPS/TLS Encryption**: All communication between the extension and Google APIs is encrypted using HTTPS with TLS 1.2+ encryption protocols, ensuring your sensitive data is protected during transmission.

- **Direct API Communication**: The extension communicates directly with Google's APIs without routing data through any intermediate servers, reducing potential security vulnerabilities.

- **No Man-in-the-Middle Risks**: By eliminating intermediate servers, we prevent potential interception or unauthorized access to your sensitive Drive data during transmission.

### Local Data Protection

- **Client-Side Processing**: All image processing and data handling occurs locally within your browser's secure extension sandbox. Your sensitive clipboard images and Drive data never leave your device except for direct upload to Google Drive.

- **Secure Browser Storage**: User preferences and settings are stored using Chrome's encrypted extension storage API, which provides built-in encryption at rest and isolation from other applications.

- **Memory Protection**: Sensitive data is only held in memory during active use and is immediately discarded when operations complete, minimizing exposure time.

- **Extension Sandbox Isolation**: Chrome's extension security model isolates our extension from web pages and other extensions, providing additional protection against cross-extension data leaks or malicious access attempts.

### Access Control and Monitoring

- **User-Controlled Access**: All access to your Google Drive data requires explicit user action. The extension cannot access your files in the background or without your direct interaction.

- **Granular Permission Control**: Users maintain full control over which folders and files the extension can access through Google's permission system and can revoke access at any time.

- **No Persistent Data Storage**: We do not maintain any databases or persistent storage systems that could be compromised. All user data remains under direct user control in their Google Drive account.

- **Audit Trail**: All file operations are logged within Google Drive's activity history, allowing users to monitor and review all extension activities.

## Data Retention and Deletion

- **Google Account Information**: Basic profile information (name, email, profile picture) received during authentication is only stored locally in your browser's secure storage. This information is not transmitted to external servers and is only used to display your account information within the extension.

- **Clipboard Data**: Images from your clipboard are processed locally and immediately uploaded to your Google Drive. We do not retain copies of your clipboard data after upload completion.

- **Local Storage**: Your preferences, settings, and selected folder information are stored only in your browser's local storage and are automatically removed when you uninstall the extension.

- **Uploaded Content**: Images you upload through Paste2Drive are stored exclusively in your Google Drive account under your direct control. They are not stored, cached, or retained by us in any form.

- **Data Deletion Options**: You can delete your data through multiple methods:
  - Uninstall the extension to remove all locally stored preferences and settings
  - Revoke the extension's access to your Google account at any time through [Google Account Security Settings](https://myaccount.google.com/permissions)
  - Delete any files uploaded to your Google Drive through Google Drive's interface
  - Use the "Clear Google authorization" option in the extension's settings to revoke access and clear stored account data

- **Data Retention Period**: We do not retain any of your data outside of your browser. All Google user data accessed by the extension is only held temporarily in memory during active use and is immediately discarded when operations complete.

- **No Data Backups**: We do not create or maintain backups of your data, as all data is stored either in your browser or in your Google Drive account under your direct control.

- **Automatic Token Expiration**: Authentication tokens automatically expire and are invalidated if the extension is not used for 90 days, requiring re-authentication for continued access.

## Data Sharing and Disclosure

We do not sell, trade, or otherwise transfer your personal information to outside parties. Your information is only shared with Google's services when you explicitly use the Extension to upload files to Google Drive. We do not have access to, store, or process your data on any servers we control.

## Third-Party Services

This Extension interacts exclusively with Google services, particularly Google Drive. When you use our Extension, you are also subject to Google's Privacy Policy. We encourage you to review Google's privacy practices:

- [Google Privacy Policy](https://policies.google.com/privacy)

## Your Rights and Choices

You can control your data in the following ways:

- **Google Account Access**: You can revoke the Extension's access to your Google account at any time by visiting [Google Account Security Settings](https://myaccount.google.com/permissions).
- **Extension Permissions**: You can review and modify the Extension's permissions in Chrome's extension settings.
- **Complete Data Control**: You maintain full ownership and control of all uploaded files through your Google Drive account.
- **Uninstallation**: You can uninstall the Extension at any time, which will remove all locally stored preferences and immediately terminate all access to your Google account.

## Data Security Architecture

The Extension is designed with a security-first architecture that ensures direct interaction between your browser and Google's services only. No data is transmitted to, processed by, or stored on any servers we control. All user data handling occurs within Chrome's secure extension environment with built-in security protections.

## Children's Privacy

The Extension is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information immediately.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last Updated" date at the top of this Privacy Policy. Continued use of the extension after such updates constitutes acceptance of the revised policy.

## Contact Us

If you have any questions about this Privacy Policy or our data protection practices, please contact us at:

- Email: bizvorpal+support@gmail.com
- GitHub: https://github.com/mksirisooriya/Paste2Drive/issues

## Consent

By using our Extension, you consent to our Privacy Policy and agree to its terms. You acknowledge that you have read and understood how we collect, use, and protect your sensitive data as described in this policy.