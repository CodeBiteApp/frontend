const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-svg@15.x: package.json "react-native" field points to src/index.ts,
// but src/fabric/ has no index.ts → bundling fails.
// Redirect the entire package to lib/commonjs/index.js so that all internal
// imports (including ./fabric) resolve consistently within the compiled output.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-svg/lib/commonjs/index.js'
      ),
      type: 'sourceFile',
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
