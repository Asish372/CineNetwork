module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optional: agar alias chahiye to uncomment karo aur install kar lo
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
          '@assets': './assets'
        }
      }],
      'react-native-reanimated/plugin' // agar reanimated use kar rahe ho to last mein rakho
    ].filter(Boolean),
  };
};
