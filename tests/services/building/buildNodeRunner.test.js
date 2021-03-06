const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildNodeRunner');

require('jasmine-expect');
const {
  BuildNodeRunner,
  buildNodeRunner,
} = require('/src/services/building/buildNodeRunner');

describe('services/building:buildNodeRunner', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    const projectConfiguration = {
      others: {
        nodemon: {
          legacyWatch: false,
        },
      },
    };
    const targets = 'targets';
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildNodeRunner(
      buildNodeRunnerProcess,
      projectConfiguration,
      targets,
      utils
    );
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toBe(buildNodeRunnerProcess);
    expect(sut.targets).toBe(targets);
    expect(sut.utils).toBe(utils);
  });

  it('should be instantiated and enable nodemon legacy watch mode', () => {
    // Given
    const buildNodeRunnerProcess = {
      enableLegacyWatch: jest.fn(),
    };
    const projectConfiguration = {
      others: {
        nodemon: {
          legacyWatch: true,
        },
      },
    };
    const targets = 'targets';
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildNodeRunner(
      buildNodeRunnerProcess,
      projectConfiguration,
      targets,
      utils
    );
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toEqual(buildNodeRunnerProcess);
    expect(sut.targets).toBe(targets);
    expect(sut.utils).toBe(utils);
    expect(buildNodeRunnerProcess.enableLegacyWatch).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when called with a browser target', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    const projectConfiguration = {
      others: {
        nodemon: {
          legacyWatch: false,
        },
      },
    };
    const targets = 'targets';
    const utils = 'utils';
    const target = {
      is: {
        browser: true,
      },
      bundle: true,
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(
      buildNodeRunnerProcess,
      projectConfiguration,
      targets,
      utils
    );
    // Then
    expect(() => sut.runTarget(target)).toThrow(/is a browser target/i);
  });

  it('should throw an error when called with a target that requires bundling', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    const projectConfiguration = {
      others: {
        nodemon: {
          legacyWatch: false,
        },
      },
    };
    const targets = 'targets';
    const utils = 'utils';
    const target = {
      is: {
        browser: false,
      },
      bundle: true,
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(
      buildNodeRunnerProcess,
      projectConfiguration,
      targets,
      utils
    );
    // Then
    expect(() => sut.runTarget(target)).toThrow(/needs to be bundled/i);
  });

  describe('without transpilation', () => {
    it('should run a target', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const environmentVariables = {
        ROSARIO: 'Charito!',
        PILAR: 'Pili!',
      };
      const targets = {
        loadTargetDotEnvFile: jest.fn(() => environmentVariables),
      };
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [],
      };
      let sut = null;
      let setupFn = null;
      let setupFnResult = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target);
      [[,,,,,,, setupFn]] = buildNodeRunnerProcess.run.mock.calls;
      setupFnResult = setupFn();
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.source}/${target.entry.development}`,
        [target.paths.source],
        target.inspect,
        [],
        [],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
      expect(setupFnResult).toEqual(environmentVariables);
      expect(targets.loadTargetDotEnvFile).toHaveBeenCalledTimes(1);
      expect(targets.loadTargetDotEnvFile).toHaveBeenCalledWith(
        target,
        'development'
      );
    });

    it('should run and inspect a target', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const targets = 'targets';
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target, true);
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.source}/${target.entry.development}`,
        [target.paths.source],
        Object.assign({}, target.inspect, { enabled: true }),
        [],
        [],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
    });

    it('should run a target and watch another target source directory', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        paths: {
          source: 'included-target-source-path',
        },
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.source}/${target.entry.development}`,
        [
          target.paths.source,
          includedTarget.paths.source,
        ],
        target.inspect,
        [],
        [],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
    });

    it('should throw an error when an included target requires bundling', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        bundle: true,
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      expect(() => sut.runTarget(target)).toThrow(/requires bundling/i);
    });

    it('should throw an error when an included target requires transpilation', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        transpile: true,
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      expect(() => sut.runTarget(target)).toThrow(/requires transpilation/i);
    });
  });

  describe('with transpilation', () => {
    it('should run a target', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const environmentVariables = {
        ROSARIO: 'Charito!',
        PILAR: 'Pili!',
      };
      const targets = {
        loadTargetDotEnvFile: jest.fn(() => environmentVariables),
      };
      const utils = {
        ensureExtension: jest.fn((filepath) => filepath),
      };
      const target = {
        bundle: false,
        transpile: true,
        paths: {
          source: 'target-source-path',
          build: 'target-build-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [],
      };
      let sut = null;
      let setupFn = null;
      let setupFnResult = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target);
      [[,,,,,,, setupFn]] = buildNodeRunnerProcess.run.mock.calls;
      setupFnResult = setupFn();
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [target.paths.build],
        target.inspect,
        [{
          from: target.paths.source,
          to: target.paths.build,
        }],
        [],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
      expect(setupFnResult).toEqual(environmentVariables);
      expect(targets.loadTargetDotEnvFile).toHaveBeenCalledTimes(1);
      expect(targets.loadTargetDotEnvFile).toHaveBeenCalledWith(
        target,
        'development'
      );
      expect(utils.ensureExtension).toHaveBeenCalledTimes(1);
      expect(utils.ensureExtension).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`
      );
    });

    it('should run a target and watch an included target that also requires transpilation', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        transpile: true,
        paths: {
          source: 'included-target-source-path',
          build: 'included-target-build-path',
        },
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = {
        ensureExtension: jest.fn((filepath) => filepath),
      };
      const target = {
        bundle: false,
        transpile: true,
        paths: {
          source: 'target-source-path',
          build: 'target-build-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [
          target.paths.build,
          includedTarget.paths.build,
        ],
        target.inspect,
        [
          {
            from: target.paths.source,
            to: target.paths.build,
          },
          {
            from: includedTarget.paths.source,
            to: includedTarget.paths.build,
          },
        ],
        [],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
      expect(utils.ensureExtension).toHaveBeenCalledTimes(1);
      expect(utils.ensureExtension).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`
      );
    });

    it('should run a target and watch an included target that doesn\'t requires transp.', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        transpile: false,
        paths: {
          source: 'included-target-source-path',
          build: 'included-target-build-path',
        },
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = {
        ensureExtension: jest.fn((filepath) => filepath),
      };
      const target = {
        bundle: false,
        transpile: true,
        paths: {
          source: 'target-source-path',
          build: 'target-build-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess.run).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [
          target.paths.build,
          includedTarget.paths.build,
        ],
        target.inspect,
        [{
          from: target.paths.source,
          to: target.paths.build,
        }],
        [{
          from: includedTarget.paths.source,
          to: includedTarget.paths.build,
        }],
        {},
        ['*.test.js'],
        expect.any(Function)
      );
      expect(utils.ensureExtension).toHaveBeenCalledTimes(1);
      expect(utils.ensureExtension).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`
      );
    });

    it('should throw an error when an included target requires bundling', () => {
      // Given
      const buildNodeRunnerProcess = {
        run: jest.fn(),
      };
      const projectConfiguration = {
        others: {
          nodemon: {
            legacyWatch: false,
          },
        },
      };
      const includedTarget = {
        name: 'included-target',
        bundle: true,
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const utils = 'utils';
      const target = {
        bundle: false,
        transpile: true,
        paths: {
          source: 'target-source-path',
          build: 'target-build-path',
        },
        entry: {
          development: 'index.development',
        },
        is: {
          browser: false,
          node: true,
        },
        inspect: {},
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(
        buildNodeRunnerProcess,
        projectConfiguration,
        targets,
        utils
      );
      expect(() => sut.runTarget(target)).toThrow(/requires bundling/i);
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const projectConfiguration = {
      others: {
        nodemon: {
          legacyWatch: false,
        },
      },
    };
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => projectConfiguration } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildNodeRunner(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildNodeRunner');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toBe('buildNodeRunnerProcess');
    expect(sut.targets).toBe('targets');
    expect(sut.utils).toBe('utils');
  });
});
