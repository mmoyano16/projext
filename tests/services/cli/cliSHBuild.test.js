const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHBuild');

require('jasmine-expect');
const {
  CLISHBuildCommand,
  cliSHBuildCommand,
} = require('/src/services/cli/cliSHBuild');

describe('services/cli:sh-build', () => {
  const getTestForTheBuildCommand = () => {
    // Given
    const test = {};
    test.targetName = 'some-target';
    test.target = {
      name: test.targetName,
      transpile: false,
      bundle: false,
      cleanBeforeBuild: true,
      is: {
        node: true,
      },
    };

    test.buildCommand = 'build';
    test.builder = {
      getTargetBuildCommand: jest.fn(() => test.buildCommand),
    };
    test.cleanCommand = 'clean';
    test.cliCleanCommand = {
      generate: jest.fn(() => test.cleanCommand),
    };
    test.copyProjectFilesCommand = 'copy-project-files';
    test.cliCopyProjectFilesCommand = {
      generate: jest.fn(() => test.copyProjectFilesCommand),
    };
    test.revisionCommand = 'revision';
    test.cliRevisionCommand = {
      generate: jest.fn(() => test.revisionCommand),
    };
    test.copyCommand = 'copy';
    test.cliSHCopyCommand = {
      generate: jest.fn(() => test.copyCommand),
    };
    test.runCommand = 'run';
    test.cliSHNodeRunCommand = {
      generate: jest.fn(() => test.runCommand),
    };
    test.transpileCommand = 'transpile';
    test.cliSHTranspileCommand = {
      generate: jest.fn(() => test.transpileCommand),
    };
    test.projectConfiguration = {
      copyOnBuild: {
        onlyOnProduction: true,
        enabled: false,
        targets: [],
      },
      version: {
        createRevisionOnBuild: {
          onlyOnProduction: true,
          enabled: false,
          targets: [],
        },
      },
    };
    test.targets = {
      getTarget: jest.fn(() => test.target),
    };
    test.sut = new CLISHBuildCommand(
      test.builder,
      test.cliCleanCommand,
      test.cliCopyProjectFilesCommand,
      test.cliRevisionCommand,
      test.cliSHCopyCommand,
      test.cliSHNodeRunCommand,
      test.cliSHTranspileCommand,
      test.projectConfiguration,
      test.targets
    );
    test.run = (type, run) => test.sut.handle(test.targetName, null, { type, run });
    return test;
  };

  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const builder = 'builder';
    const cliCleanCommand = 'cliCleanCommand';
    const cliCopyProjectFilesCommand = 'cliCopyProjectFilesCommand';
    const cliRevisionCommand = 'cliRevisionCommand';
    const cliSHCopyCommand = 'cliSHCopyCommand';
    const cliSHNodeRunCommand = 'cliSHNodeRunCommand';
    const cliSHTranspileCommand = 'cliSHTranspileCommand';
    const projectConfiguration = 'projectConfiguration';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHBuildCommand(
      builder,
      cliCleanCommand,
      cliCopyProjectFilesCommand,
      cliRevisionCommand,
      cliSHCopyCommand,
      cliSHNodeRunCommand,
      cliSHTranspileCommand,
      projectConfiguration,
      targets
    );
    // Then
    expect(sut).toBeInstanceOf(CLISHBuildCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.builder).toBe(builder);
    expect(sut.cliCleanCommand).toBe(cliCleanCommand);
    expect(sut.cliCopyProjectFilesCommand).toBe(cliCopyProjectFilesCommand);
    expect(sut.cliRevisionCommand).toBe(cliRevisionCommand);
    expect(sut.cliSHCopyCommand).toBe(cliSHCopyCommand);
    expect(sut.cliSHNodeRunCommand).toBe(cliSHNodeRunCommand);
    expect(sut.cliSHTranspileCommand).toBe(cliSHTranspileCommand);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(2);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'run',
      '-r, --run',
      expect.any(String),
      false
    );
    expect(sut.hidden).toBeTrue();
  });

  it('should return the command to build a node target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build a node target that requires bundling', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.bundle = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build a node target that requires transpiling', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.runOnDevelopment = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
      test.runCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target that requires bundling', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.bundle = true;
    test.target.runOnDevelopment = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target that requires transpiling', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.target.runOnDevelopment = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.runCommand,
    ].join(';'));
  });

  it('should return the command to build a browser target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and run a browser target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    test.target.runOnDevelopment = true;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and `force` run a browser target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    test.target.runOnDevelopment = false;
    // When
    test.run('development', true);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should never return the command to run a target with a `production` build type', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.target.runOnDevelopment = true;
    // When
    test.run('production', true);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision on with a `production` build type', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.createRevisionOnBuild.enabled = true;
    // When
    test.run('production', true);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision on with a `development` build type', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.createRevisionOnBuild.onlyOnProduction = false;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision for an specific target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.createRevisionOnBuild.targets.push(test.targetName);
    // When
    test.run('production', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('shouldn\'t return the command to copy the revision if the target is not on the list', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.createRevisionOnBuild.targets.push('random-target');
    // When
    test.run('production', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to copy the files on with a `production` build type', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copyOnBuild.enabled = true;
    // When
    test.run('production', true);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('should return the command to copy the files on with a `development` build type', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copyOnBuild.enabled = true;
    test.projectConfiguration.copyOnBuild.onlyOnProduction = false;
    // When
    test.run('development', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('should return the command to copy the files for an specific target', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copyOnBuild.enabled = true;
    test.projectConfiguration.copyOnBuild.targets.push(test.targetName);
    // When
    test.run('production', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('shouldn\'t return the command to copy the files if the target is not on the list', () => {
    // Given
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copyOnBuild.enabled = true;
    test.projectConfiguration.copyOnBuild.targets.push('random-target');
    // When
    test.run('production', false);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliSHBuildCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHBuildCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHBuildCommand);
    expect(sut.builder).toBe('builder');
    expect(sut.cliCleanCommand).toBe('cliCleanCommand');
    expect(sut.cliCopyProjectFilesCommand).toBe('cliCopyProjectFilesCommand');
    expect(sut.cliRevisionCommand).toBe('cliRevisionCommand');
    expect(sut.cliSHCopyCommand).toBe('cliSHCopyCommand');
    expect(sut.cliSHNodeRunCommand).toBe('cliSHNodeRunCommand');
    expect(sut.cliSHTranspileCommand).toBe('cliSHTranspileCommand');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.targets).toBe('targets');
  });
});