module.exports = {
    theme: {
      extend: {
        fontFamily: {
          poppins: ['Poppins', 'sans-serif'],
        },
      },
    },
    // Add the Poppins font to your plugins
    plugins: [
      require('@tailwindcss/typography'),
      // other plugins
    ],
  }