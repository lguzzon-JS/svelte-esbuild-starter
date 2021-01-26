const { build } = require('esbuild')
const { derver } = require('derver')
const sveltePlugin = require('esbuild-svelte')
const argv = require('minimist')(process.argv.slice(2))

const DEV = !!argv['dev']

// Development server configuration. To configure production server
// see `start` script in `package.json` file.

const HOST = !!argv['HOST'] ? argv['HOST'] : 'localhost'
const PORT = !!argv['PORT'] ? argv['PORT'] : 5000

async function buildClient() {
  return await build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'public/build/bundle.js',
    mainFields: ['svelte', 'module', 'main'],
    minify: !DEV,
    incremental: DEV,
    sourcemap: DEV && 'inline',
    plugins: [
      sveltePlugin({
        compileOptions: {
          // Svelte compile options
          dev: DEV,
          css: false // use `css:true` to inline CSS in `bundle.js`
        },

        preprocessor: [
          // Place here any Svelte preprocessors
        ]
      })
    ]
  })
}

buildClient().then((bundle) => {
  DEV &&
    derver({
      dir: 'public',
      host: HOST,
      port: PORT,
      watch: ['public', 'src'],
      onwatch: async (lr, item) => {
        if (item === 'src') {
          lr.prevent()
          bundle
            .rebuild()
            .catch((err) => lr.error(err.message, 'Svelte compile error'))
        }
      }
    })
})
