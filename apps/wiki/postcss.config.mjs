const config = {
  plugins: [
    '@tailwindcss/postcss',
    ...(process.env.NODE_ENV !== 'development'
      ? [
          [
            'postcss-preset-env',
            {
              // Optionally add plugin options
              // features: {
              //   'cascade-layers': false // 最好能关掉，开了 css module 会不正常
              // }
            },
          ],
        ]
      : []),
  ],
};

export default config;
