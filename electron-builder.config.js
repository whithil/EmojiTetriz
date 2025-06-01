/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "com.example.nextron", // Replace with your app's ID
  productName: "NextronApp", // Replace with your app's name
  mainProcessFile: "electron/main.js", // Path to the main Electron file
  files: [
    "out/**/*", // Include the Next.js build output
    "electron/**/*", // Include Electron-specific files (main.js, preload.js)
    "package.json" // Include package.json
  ],
  directories: {
    output: "dist_electron" // Output directory for bundled app
  },
  win: { // Windows-specific configuration
    target: "nsis", // Target installer format
    icon: "src/app/favicon.ico" // Path to your app icon (optional)
  },
  nsis: { // NSIS specific configuration (Windows installer)
    oneClick: false, // Allow user to choose installation path
    allowToChangeInstallationDirectory: true
  }
};

module.exports = config;
