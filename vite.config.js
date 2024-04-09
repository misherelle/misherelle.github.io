const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    hot: true,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
    historyApiFallback: true,
  },
  build: {
    outDir: path.join(__dirname, './server/build'),
  },
});
