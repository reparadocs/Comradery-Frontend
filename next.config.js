const withCSS = require('@zeit/next-css');
const withSourceMaps = require('@zeit/next-source-maps')();

const path = require('path');
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const withSass = require('@zeit/next-sass');
const withOffline = require('next-offline');

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const env = {
    isDev
  };

  return withOffline(
    withSass(
      withCSS(
        withSourceMaps({
          transformManifest: isDev
            ? null
            : (manifest) => ['/'].concat(manifest), // add the homepage to the cache

          workboxOpts: isDev
            ? null
            : {
                swDest: 'static/service-worker.js',
                runtimeCaching: [
                  {
                    urlPattern: /^https?.*/,
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'https-calls',
                      networkTimeoutSeconds: 15,
                      expiration: {
                        maxEntries: 150,
                        maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
                      },
                      cacheableResponse: {
                        statuses: [0, 200]
                      }
                    }
                  }
                ]
              },
          webpack: (config, { isServer, webpack, buildId }) => {
            if (isServer) {
              // Implementation detail of next.js, externals is an array of one function if isServer is true
              // This avoid a error when building the app to production ¯\_(ツ)_/¯
              const [externals] = config.externals;
              config.externals = (context, request, callback) => {
                if (path.isAbsolute(request)) {
                  return callback();
                }
                return externals(context, request, callback);
              };
            }
            return config;
          },
          env
        })
      )
    )
  );
};
