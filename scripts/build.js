const { join } = require('path')
const { readdir } = require('fs/promises')
const { existsSync } = require('fs')
const { rollup } = require('rollup')
const { loadConfigFile } = require('rollup/loadConfigFile')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

async function build(inv) {
  const cwd = __dirname

    const inFile = join(
        cwd,
        '..',
        'index.mjs',
    )

    const outFile = join(
        cwd,
        '..',
        'dist',
        'sample-component.mjs'
    )

    const rollupFile = join(cwd, '..', 'rollup.config.mjs')
    if(existsSync(rollupFile)) {
        await externalRollup(rollupFile, inFile, outFile);
    } else {
        await internalRollup(inFile, outFile);
    }
}

const internalRollup = async (inFile, outFile) => {
  const bundle = await rollup({
    input: inFile,
    plugins: [
      resolve(),
      commonjs({
        include: 'node_modules/**'
      })
    ]
  })

  await bundle.write({
    file: outFile,
    format: 'es'
  })
}

const externalRollup = async (rollupFile, inFile, outFile) => {
  let rollUpConfig = {}
  let grab = memoize(loadConfigFile)
  const { options, warnings } = await grab(rollupFile)

  if(!warnings?.count) {
    rollUpConfig = options
  }

  //eslint-disable-next-line no-undef
  await Promise.all(rollUpConfig.map(async config => {
    config.input = inFile
    config.plugins.unshift(resolve())
    const bundle = await rollup(config)
    config.output.forEach(o => {
      o.file = outFile
      o.format = 'es'
    })
    //eslint-disable-next-line no-undef
    await Promise.all(config.output.map(bundle.write))
  }))
}

const memoize = (fn) => {
  let cache = {}
  return async (obj) => {
    if(obj in cache) {
      return cache[obj]
    } else {
      cache[obj] = await fn(obj)
      return cache[obj]
    }
  }
}

build().then(() => console.log('build done'))
