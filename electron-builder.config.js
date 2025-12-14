module.exports = {
  appId: "com.inviOX.app",
  productName: "InviOX OfflineApp",

  directories: {
    output: "dist_electron",
  },

  files: [
    "electron/**/*",
    "renderer/dist/**/*",
    "package.json"
  ],

  // WINDOWS
  win: {
    target: ["nsis"],
  },

  // MAC
  mac: {
    target: ["dmg"],
  },

  // LINUX
  linux: {
    target: ["AppImage"],
  },

  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
  }
};
