// The app shares the payoff engine with the web app. Metro watches ../src so
// that it can bundle ../src/utils and ../src/constants.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const webRoot = path.resolve(projectRoot, '..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...(config.watchFolders ?? []), path.join(webRoot, 'src')]

// Resolve packages from the shared code against this app first. The web
// node_modules folder does not exist in an EAS build.
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')]

// Hermes has no crypto.getRandomValues, which the default nanoid needs.
// The ids only key rows, so the non-secure generator is enough.
const defaultResolve = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = moduleName === 'nanoid' ? 'nanoid/non-secure' : moduleName
  const resolve = defaultResolve ?? context.resolveRequest
  return resolve(context, name, platform)
}

module.exports = config
