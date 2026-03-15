module.exports = {
  appId: "com.inviOX.app",
  productName: "InviOX Billing App",

  directories: {
    output: "dist_electron",
  },

  files: ["electron/**/*", "renderer/dist/**/*", "package.json"],

  // WINDOWS
  win: {
    target: ["nsis"],
    icon: "assets/icon.ico", // 👈 Add this
  },

  // MAC
  mac: {
    target: ["dmg"],
    icon: "assets/icon.icns", // 👈 Add this
  },

  // LINUX
  linux: {
    target: ["AppImage"],
    icon: "assets/icon.png", // 👈 Add this
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
};
