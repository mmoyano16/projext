const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHRun');

require('jasmine-expect');
const {
  CLISHRunCommand,
  cliSHRunCommand,
} = require('/src/services/cli/cliSHRun');

describe('services/cli:sh-run', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const cliBuildCommand = 'cliBuildCommand';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.cliBuildCommand).toBe(cliBuildCommand);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'inspect',
      '-i, --inspect',
      expect.any(String),
      false
    );
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should return the command to run a target when executed', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    const options = {
      inspect: false,
    };
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand, targets);
    sut.handle(target, null, options);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: 'development',
      run: true,
      inspect: options.inspect,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to run a target when executed and include unkown options', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    const options = {
      inspect: true,
    };
    const unknownOptName = 'name';
    const unknownOptValue = 'Rosario';
    const unknownOptions = {
      target: 'someTarget',
      [unknownOptName]: unknownOptValue,
    };
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand, targets);
    sut.handle(target, null, options, unknownOptions);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: 'development',
      run: true,
      inspect: options.inspect,
      [unknownOptName]: unknownOptValue,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to run the default target when executed', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getDefaultTarget: jest.fn(() => ({ name: target })),
    };
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand, targets);
    sut.handle(null, null, {});
    // Then
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: 'development',
      run: true,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliSHRunCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHRunCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.cliBuildCommand).toBe('cliBuildCommand');
    expect(sut.targets).toBe('targets');
  });
});
