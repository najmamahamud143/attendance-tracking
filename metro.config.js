const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Redirect @react-native-community/netinfo to its compiled lib instead of
// TypeScript source, which Metro fails to resolve on Windows.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@react-native-community/netinfo') {
    return {
      filePath: require.resolve('@react-native-community/netinfo/lib/commonjs/index.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
