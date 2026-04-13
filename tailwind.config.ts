import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        magna: '#a020f0',
        'magna-light': 'rgba(160,32,240,0.19)',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        pill: '100px',
      },
    },
  },
  safelist: ['bg-blue-500', 'border-indigo-500'],
  plugins: [],
};

export default config;
