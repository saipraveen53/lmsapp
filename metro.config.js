const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for "Cannot destructure property '__extends' of 'tslib.default'" on Web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "tslib") {
    return {
      filePath: require.resolve("tslib/tslib.es6.js"),
      type: "sourceFile",
    };
  }
  // Standard resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
