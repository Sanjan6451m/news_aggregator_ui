import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

const server = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');
const commonEngine = new CommonEngine();

// Serve static files from /browser
server.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y'
}));

// All regular routes use the Angular engine
server.get('*', async (req, res) => {
  try {
    const { protocol, originalUrl, baseUrl, headers } = req;

    const html = await commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    });

    res.send(html);
  } catch (error) {
    console.error('Error during rendering:', error);
    res.status(500).send('Server Error');
  }
});

// Export for Vercel
export default server;

// Only run standalone server when not in Vercel
if (!process.env['VERCEL']) {
  const port = process.env['PORT'] || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
