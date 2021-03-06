const ObjectUtils = require('wootils/shared/objectUtils');
const fs = require('fs-extra');
const { provider } = require('jimple');
const CLISubCommand = require('../../../abstracts/cliSubCommand');
/**
 * This is a CLI generator that allows the user to create a configuration file with all the
 * default settings and all the information projext assumes about the project.
 * @extends {CLISubCommand}
 */
class ProjectConfigurationFileGenerator extends CLISubCommand {
  /**
   * Class constructor.
   * @param {Logger}                       appLogger            To inform the user when the file
   *                                                            has been generated, or if something
   *                                                            went wrong.
   * @param {Prompt}                       appPrompt            To ask the user the path to the
   *                                                            file.
   * @param {PathUtils}                    pathUtils            To build the absolute path for the
   *                                                            file.
   * @param {ProjectConfigurationSettings} projectConfiguration To get all the settings that are
   *                                                            going to go on the file.
   * @param {Utils}                        utils                To format some of the options
   *                                                            into human readable descriptions.
   */
  constructor(appLogger, appPrompt, pathUtils, projectConfiguration, utils) {
    super();
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `appPrompt` service.
     * @type {Prompt}
     */
    this.appPrompt = appPrompt;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     */
    this.utils = utils;
    /**
     * The resource type the user will have to select on the CLI command that manages the
     * generator.
     * @type {string}
     */
    this.name = 'config';
    /**
     * A short description of what the generator does.
     * @type {string}
     */
    this.description = 'Generate a configuration based on what projext knows of your project';
    /**
     * A list with the names the configuration file can have and that projext supports.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._nameOptions = [
      'projext.config.js',
      'config/projext.config.js',
      'config/project.config.js',
    ];

    this.addOption(
      'all',
      '-a, --all',
      'Save the file with all the project settings instead of just the targets',
      false
    );
    this.addOption(
      'include',
      '-i, --include',
      'A list of directory-like paths of the specific settings you want to include. ' +
        'To use without -all',
      'targets'
    );
    this.addOption(
      'exclude',
      '-e, --exclude',
      'A list of directory-like paths of the specific settings you want to exclude. ' +
        'To use with -all',
      ''
    );
  }
  /**
   * This method first prompts the user for the name of configuration file, it needs to be one
   * supported by projext, after that, if the file already exists it asks for confirmation, and then
   * it finally writes it.
   * @param {Object}  options         A dictionary with the received options for the generator.
   * @param {boolean} options.all     Whether to save all the settings or just the targets.
   * @param {?string} options.include A list of directory-like paths for specific settings to save.
   * @param {?string} options.exclude A list of directory-like paths for specific settings to
   *                                  ignore.
   * @return {Promise<undefined,Error>}
   */
  handle(options = {}) {
    // Define the variable for the promise that will be returned.
    let result;
    // Define the variable for the object that will contain the settings to write.
    let settings;

    // Validate that the required settings exist.
    try {
      settings = options.all ?
        this._getAllSettings(options.exclude) :
        this._getSettings(options.include);
    } catch (error) {
      result = Promise.reject(error);
    }

    // Continue with the execution only if the wasn't an error obtaining the settings.
    if (!result) {
      // Get the first name option to use as default.
      const [firstNameOption] = this._nameOptions;
      /**
       * Format the list so it can be added as an error message in case the user selects an
       * invalid name.
       */
      const nameOptionsStr = this.utils.humanReadableList(
        this._nameOptions.map((option) => `'${option}'`)
      );
      // Define the prompt schema.
      const schema = {
        filename: {
          default: firstNameOption,
          description: 'Filename',
          message: `It can only be one of these: ${nameOptionsStr}`,
          required: true,
          // Validate that the selected name is supported by projext.
          conform: (value) => this._nameOptions.includes(value.toLowerCase()),
          // Always save the selected name on lower case.
          before: (value) => value.toLowerCase(),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: 'Overwrite existing file',
          required: true,
          // Only ask for an overwrite confirmation if the file already exists.
          ask: () => {
            const filename = this.appPrompt.getValue('filename');
            return fs.pathExistsSync(this.pathUtils.join(filename));
          },
        },
      };

      let filepath;
      let creating = false;
      // Ask the user...
      return this.appPrompt.ask(schema)
      .then((results) => {
        // Build the path to the file.
        filepath = this.pathUtils.join(results.filename);
        // Check if the file already exists.
        const exists = fs.pathExistsSync(filepath);
        let nextStep;
        // If the file doesn't exist or if it exists but the user choose to overwrite it...
        if (!exists || (exists && results.overwrite)) {
          creating = true;
          // ...write the file.
          nextStep = this._writeSettings(filepath, settings);
        }

        return nextStep;
      })
      .then(() => {
        // If the file was created, inform the user.
        if (creating) {
          this.appLogger.success(`The configuration file was successfully generted: ${filepath}`);
        }
      })
      .catch((error) => {
        let nextStep;
        // If the process failed and it wasn't because the user canceled the input...
        if (error.message !== 'canceled') {
          // ...show the error.
          this.appLogger.error('There was an error while generating the configuration file');
          nextStep = Promise.reject(error);
        }

        return nextStep;
      });
    }

    return result;
  }
  /**
   * Get all the settings on the project configuration, with the possibility of excluding some
   * of them.
   * @param {string} [exclude=''] A list of comma separated paths for settings that should be
   *                              excluded.
   *                              For example: `'targetsTemplates/browser,copy,version'`.
   * @return {Object}
   * @ignore
   * @access protected
   */
  _getAllSettings(exclude = '') {
    return exclude
    .split(',')
    .reduce(
      (obj, objPath) => (objPath ? ObjectUtils.delete(obj, objPath, '/', true, true) : obj),
      ObjectUtils.copy(this.projectConfiguration)
    );
  }
  /**
   * Get specific settings from the project configuration.
   * @param {string} [settings='targets'] A list of comma separated paths for the required settings
   *                                      For example: `'targetsTemplates/browser,copy,version'`.
   * @return {Object}
   * @ignore
   * @access protected
   */
  _getSettings(settings = 'targets') {
    return settings
    .split(',')
    .reduce(
      (obj, objPath) => {
        const value = ObjectUtils.get(this.projectConfiguration, objPath, '/', true);
        return ObjectUtils.set(obj, objPath, value, '/', true);
      },
      {}
    );
  }
  /**
   * Formats a settings dictionary in order to write it as a JS object on an specific file.
   * @param {string} filepath The path to the file where the configuration should be written.
   * @param {Object} settings The dictionary of settings to write on the file.
   * @return {Promise<undefined,Error>}
   * @private
   * @access protected
   */
  _writeSettings(filepath, settings) {
    // Convert the configuration into a string with proper indentation.
    const jsonIndentation = 2;
    const json = JSON.stringify(settings, undefined, jsonIndentation)
    // Escape single quotes.
    .replace(/'/g, '\\\'')
    // Replace double quotes with single quotes.
    .replace(/"/g, '\'')
    // Remove single quotes from keys.
    .replace(/^(\s+)?(')(\w+)('): /mg, '$1$3: ')
    /**
     * Add trailing commas. The reason the regex is executed twice is because matches can't
     * intersect other matches, and since the regex uses a closing symbol as delimiter, that same
     * delimiter can't be fixed unless we run the regex again.
     */
    .replace(/([\]|}|\w|'])(\n(?:\s+)?[}|\]])/g, '$1,$2')
    .replace(/([\]|}])(\n(?:\s+)?[}|\]])/g, '$1,$2');

    const template = `module.exports = ${json};\n`;

    return fs.writeFile(filepath, template);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `ProjectConfigurationFileGenerator` as the `projectConfigurationFileGenerator` service.
 * @example
 * // Register it on the container
 * container.register(projectConfigurationFileGenerator);
 * // Getting access to the service instance
 * const projectConfigurationFileGenerator = container.get('projectConfigurationFileGenerator');
 * @type {Provider}
 */
const projectConfigurationFileGenerator = provider((app) => {
  app.set('projectConfigurationFileGenerator', () => new ProjectConfigurationFileGenerator(
    app.get('appLogger'),
    app.get('appPrompt'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('utils')
  ));
});

module.exports = {
  ProjectConfigurationFileGenerator,
  projectConfigurationFileGenerator,
};
