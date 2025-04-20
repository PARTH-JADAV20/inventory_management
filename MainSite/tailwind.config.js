// tailwind.config.js
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontSize: {
          'h1-base': '2.25rem', // text-4xl
          'h2-base': '1.875rem', // text-3xl
          'h3-base': '1.5rem',   // text-2xl
          'h4-base': '1.25rem',  // text-xl
          'h5-base': '1.125rem', // text-lg
          'h6-base': '1rem',     // text-base
        },
      },
    },
    plugins: [],
  };
  