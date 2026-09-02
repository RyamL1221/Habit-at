module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin powers Reanimated 4 worklets and MUST be
    // listed last. Without it, Metro cannot transform the animation callbacks
    // (useAnimatedStyle / withTiming / withRepeat, etc.) and the bundle fails.
    plugins: ['react-native-worklets/plugin'],
  };
};
