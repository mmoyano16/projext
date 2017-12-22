const { provider } = require('jimple');
const ConfigurationFile = require('../../interfaces/configurationFile');

class ProjectConfiguration extends ConfigurationFile {
  constructor(pathUtils) {
    super(pathUtils, 'project.config.js');
  }

  createConfig() {
    return {
      version: {
        replaceKey: 'APP_VERSION',
        createRevisionFile: true,
        revisionFilename: 'revision',
      },
      paths: {
        source: 'src',
        build: 'dist',
        privateModules: 'private',
        output: {
          js: 'statics/js',
          fonts: 'statics/fonts',
          css: 'statics/css',
          images: 'statics/img',
        },
      },
      targetsTemplates: {
        node: {
          type: 'node',
          bundler0: 'webpack',
          hasFolder: true,
          folder: '',
          createFolder: false,
          entry: {
            development: 'start.development.js',
            production: 'start.production.js',
          },
          transpile: false,
          bundle: false,
          run: true,
          babel: {
            features: {},
            nodeVersion: 'current',
            overwrites: {},
          },
          flow: false,
          library: false,
          libraryOptions: {},
        },
        browser: {
          type: 'browser',
          bundler: 'webpack',
          hasFolder: true,
          folder: '',
          createFolder: true,
          entry: {
            development: 'index.js',
            production: 'index.js',
          },
          sourceMap: {
            development: false,
            production: true,
          },
          html: {
            template: 'index.tpl.html',
            filename: 'index.tpl.html',
          },
          babel: {
            features: {},
            browserVersions: 2,
            mobileSupport: true,
            overwrites: {},
          },
          flow: false,
          CSSModules: false,
          hotReload: false,
          library: false,
          libraryOptions: {},
        },
      },
      copy: [
        '.nvmrc',
        'config',
        'package.json',
        'utils',
      ],
      targets: {},
    };
  }
}

const projectConfiguration = provider((app) => {
  app.set('projectConfiguration', () => new ProjectConfiguration(
    app.get('pathUtils')
  ));
});

module.exports = {
  ProjectConfiguration,
  projectConfiguration,
};