import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

// Plugin to copy script.js to dist (Vite doesn't bundle non-module scripts)
function copyScriptPlugin() {
  return {
    name: 'copy-script',
    closeBundle() {
      const src = resolve(__dirname, 'script.js');
      const dest = resolve(__dirname, 'dist', 'script.js');
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log('Copied script.js to dist');
      }
    },
  };
}

export default defineConfig({
  plugins: [copyScriptPlugin()],
});
