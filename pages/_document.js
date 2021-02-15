import Document, { Html, Head, Main, NextScript } from 'next/document';
import * as snippet from '@segment/snippet';
import React from 'react';
import { isProduction } from '../utils';

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          {isProduction() && (
            <script
              dangerouslySetInnerHTML={{
                __html: snippet.min({
                  apiKey: 'Xu9fRA0N8G69bza4HuKkv7xIJkqN3luz',
                  page: false
                })
              }}
            />
          )}
          <link rel='manifest' href='./manifest.json' />
          <link rel='icon' href='favicon.ico' type='image/x-icon' />
          <link rel='stylesheet' href='/bootstrap.css' />
          <link rel='stylesheet' href='/image-crop.css' />
          <link rel='stylesheet' href='/editor.css' />
          <link rel='stylesheet' href='/react-toggle.css' />
          <meta name='theme-color' content='#ffffff' />
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content='default'
          />
          <meta name='apple-mobile-web-app-capable' content='yes' />

          <link rel='apple-touch-icon' href='/logo192.png' />
          <link rel='stylesheet' href='/emoji.css' />
          <meta charSet='UTF-8' />
          <link
            rel='stylesheet'
            href='https://cdn.jsdelivr.net/npm/instantsearch.css@7.3.1/themes/reset-min.css'
            integrity='sha256-t2ATOGCtAIZNnzER679jwcFcKYfLlw01gli6F6oszk8='
            crossOrigin='anonymous'
          />
          <link
            rel='stylesheet'
            href='//cdn.quilljs.com/1.2.6/quill.snow.css'
          />
          <link
            rel='stylesheet'
            href='//cdn.quilljs.com/1.2.6/quill.bubble.css'
          />
          <link rel='stylesheet' href='https://use.typekit.net/own4jik.css' />
        </Head>
        <body style={{ overflowY: 'auto' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
