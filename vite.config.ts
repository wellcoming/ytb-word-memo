import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Youtube Word Memo',
        namespace: 'http://tampermonkey.net/',
        version: pkg.version,
        description: pkg.description,
        author: 'wellcoming',
        match: [
          '*://www.youtube.com/watch*',
          '*://www.youtube.com',
          '*://www.youtube.com/*'
        ],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=youtube.com',
        connect: 'dict.youdao.com',
        license: 'AGPL-3.0'
      },
    }),
  ],
});
