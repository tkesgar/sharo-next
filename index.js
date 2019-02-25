const path = require('path')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
const withSass = require('@zeit/next-sass')
const withWorkers = require('@zeit/next-workers')

/**
 * This function is a Next.js plugin for sharo.
 *
 * Features:
 *   - Bundle analysis reporter via `@zeit/next-bundle-analyzer`
 *   - MDX support via `@zeit/next-mdx`
 *   - Web Workers transpilation support via `@zeit/next-workers`
 *   - SASS/SCSS support via `@zeit/next-sass`
 *
 * To generate bundle analysis report, provide `BUNDLE_ANALYZE` environment
 * variable with one of the following values:
 *   - `server`: generate server report only
 *   - `client`: generate client report only
 *   - `both`: generate both server and client report
 *
 * Docs:
 *   - https://nextjs.org/docs#custom-configuration
 *   - https://www.npmjs.com/package/@zeit/next-bundle-analyzer
 *   - https://www.npmjs.com/package/@zeit/next-mdx
 *   - https://www.npmjs.com/package/@zeit/next-sass
 *   - https://www.npmjs.com/package/@zeit/next-workers
 *
 * @param {any} nextConfig Next.js configuration object
 * @returns {any} New Next.js configuration object
 */
function withSharo(nextConfig = {}) {
  const {BUNDLE_ANALYZE} = process.env

  // https://github.com/zeit/next-plugins/issues/320
  const withMdx = require('@zeit/next-mdx')({
  // Allow regular markdown files (*.md) to be imported.
    extension: /\.mdx?$/
  })

  return (
    withBundleAnalyzer(withWorkers(withSass(withMdx(
      Object.assign(
        // =====================================================================
        // Default configurations (can be overridden by nextConfig)
        // =====================================================================
        {
          // Configuration for next-bundle-analyzer so it can be controlled via
          // BUNDLE_ANALYZE environment variables.
          analyzeServer: ['server', 'both'].includes(BUNDLE_ANALYZE),
          analyzeBrowser: ['browser', 'both'].includes(BUNDLE_ANALYZE),
          bundleAnalyzerConfig: {
            server: {
              analyzerMode: 'static',
              reportFilename: path.resolve('./bundles/server.html')
            },
            browser: {
              analyzerMode: 'static',
              reportFilename: path.resolve('./bundles/client.html')
            }
          }
        },
        // =====================================================================
        // Override default configurations with nextConfig
        // =====================================================================
        nextConfig,
        // =====================================================================
        // Override nextConfig configurations
        // (note to self: follow Next.js rules on this section)
        // =====================================================================
        {
          webpack(config, options) {
          // Allow autoresolving of MDX (*.md, *.mdx) and SCSS (*.scss, *.sass)
            config.resolve.extensions.push('.md', '.mdx', '.scss', '.sass')

            if (typeof nextConfig.webpack === 'function') {
              return nextConfig.webpack(config, options)
            }

            return config
          }
        }
      )
    ))))
  )
}

module.exports = withSharo
