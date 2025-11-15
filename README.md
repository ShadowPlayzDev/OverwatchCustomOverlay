OverwatchCustomOverlay

🖼️ Customizable Overlay for PC Games

Overwatch Custom Overlay is a simple, customizable overlay application built with Electron that allows you to display custom images (often referred to as 'skins') over your gameplay.

While originally designed with Overwatch in mind, it works with any game running in Windowed or Borderless Fullscreen mode!

✨ Features

Customizable Skins: Easily add your own overlay images (skins) using a simple folder structure and JSON configuration (details below).

Game Agnostic: Works for Overwatch and any other PC game running in a windowed mode.

Simple Setup: Install via a ready-to-use setup file for quick deployment.

Built with Electron: Leverages the robustness of Electron for cross-platform overlay functionality.

⚠️ Important Note: Display Mode

The overlay does not work when games are running in Exclusive Fullscreen mode. Please ensure your game's display setting is set to Windowed or Borderless Fullscreen to allow the overlay to appear. For some games "Fullscreen" is actually borderless fullscreen (you can test this by seeing if your screen flashes when you press ALT + TAB)

📂 File Location & Storage

All user-added assets (skins) and application configuration are stored locally in the operating system's application data folder.

User Skin Directory

OS

Path

Windows

%AppData%\ow-custom-overlay\skins\

Tip: On Windows, you can quickly navigate to the main application data folder by typing %AppData%\ow-custom-overlay into the File Explorer address bar.

🛠️ Installation & Setup

There are two primary ways to get the application:

1. Recommended: Install via Setup Files

For most users, the easiest way to install is by running the packaged setup file.

Download the latest installer from the Releases page

Run the installer and follow the on-screen prompts.

2. Build from Source

This method is for contributors or users who prefer to build the application themselves.

Clone the repository using Git:

git clone https://github.com/ShadowPlayzDev/OverwatchCustomOverlay.git


Navigate to the source directory:

cd OverwatchCustomOverlay


Install dependencies (Requires Node.js and npm):

npm install


To start the application in development mode:

npm start


To generate an installable package (using Electron Forge):

npm run make


The generated setup files (e.g., .exe, .deb, .rpm) will be placed in the /out directory.

📝 License

This project is licensed under the MIT License.

🧑‍💻 Author

ShadowPlayzDev (on GitHub)

---

The app will scan for skins by checking each folder inside skins for a skin.json. That JSON will tell the app what to call it and where it is!
Here is a example of one:
```{
  "name": "Skin A",
  "image": "skin.png",
  "author": "ShadowPlayzDev",
  "description": "Sample overlay skin for testing. Displays a basic image."
}```
Your skin will NOT show up if it cannot read this file properly or this file doesn't exist.