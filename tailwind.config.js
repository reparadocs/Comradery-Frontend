module.exports = {
  theme: {
    extend: {
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      }
    }
  },
  variants: {
    borderColor: [
      'responsive',
      'hover',
      'focus',
      'focus-within',
      'group-hover'
    ],
    textDecoration: ['group-hover', 'hover', 'responsive'],
    textAlign: ['responsive'],
    borderRadius: ['responsive', 'hover'],
    opacity: ['group-hover', 'hover', 'responsive'],
    textColor: ['group-hover', 'hover', 'responsive'],
    borderWidth: ['first', 'responsive', 'hover', 'last'],
    margin: ['responsive', 'last'],
    display: ['responsive', 'group-hover']
  },
  plugins: []
};
