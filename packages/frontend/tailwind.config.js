module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    screens: {
      'xs': '376px',
      'sm': '640px',
      'md': '750px',
      'lg': '1024px',
      'xl': '1270px',
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
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
};
