const config = {
  plugins: [
    '@tailwindcss/postcss',
    ...(process.env.NODE_ENV !== 'development'
      ? [
          [
            'postcss-preset-env',
            {
              // Optionally add plugin options
            },
          ],
        ]
      : []),
  ],
};

export default config;
