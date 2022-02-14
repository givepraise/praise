const CracoAlias = require('craco-alias');

module.exports = {
  style: {
    postcssOptions: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.paths.json',
        unsafeAllowModulesOutsideOfSrc: true,
      },
    },
  ],
  eslint: {
    enable: false, //TODO enable eslint during build
  },
};
