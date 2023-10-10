module.exports = ({ config }) => {
  config.module.rules.push(
    // Existing rule for TypeScript files
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
        },
      ],
    },
    // New rule for image files
    {
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ],
    }
  );
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};