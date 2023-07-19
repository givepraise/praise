module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    screens: {
      xs: '376px',
      sm: '640px',
      md: '750px',
      lg: '1024px',
      xl: '1270px',
      tall: { raw: '(min-height: 800px)' },
    },
    extend: {
      colors: {
        'warm-gray': {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        themecolor: {
          1: '#FF33A7',
          2: '#FF0A95',
          3: '#E1007F',
          4: '#B80068',
          5: '#8F0051',
        },
        'themecolor-alt': {
          1: '#564148',
          2: '#BDA5AC',
          3: '#946F00',
          4: '#D0A200',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
