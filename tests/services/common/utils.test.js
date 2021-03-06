const path = require('path');
const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/common/utils');

require('jasmine-expect');

const { Utils, utils } = require('/src/services/common/utils');

describe('services/common:utils', () => {
  describe('replacePlaceholders', () => {
    it('should replace placeholders on a string', () => {
      // Given
      const placeholders = {
        name: 'Charito',
        birthday: 'September 25, 2015',
      };
      const cases = [
        // One placeholder
        {
          original: 'Hello [name]',
          expected: `Hello ${placeholders.name}`,
        },
        // Multiple placeholders
        {
          original: '[name] was born on [birthday]',
          expected: `${placeholders.name} was born on ${placeholders.birthday}`,
        },
        // Same placeholder, multiple times
        {
          original: '[name] [name] [name]!!!',
          expected: `${placeholders.name} ${placeholders.name} ${placeholders.name}!!!`,
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => Utils.replacePlaceholders(info.original, placeholders));
      // Then
      cases.forEach((info, index) => {
        expect(results[index]).toBe(info.expected);
      });
    });

    it('should replace placeholders on a string, with custom placeholders limiters', () => {
      // Given
      const placeholders = {
        name: 'Charito',
        birthday: 'September 25, 2015',
      };
      const cases = [
        // One placeholder
        {
          original: 'Hello [name]',
          expected: `Hello ${placeholders.name}`,
          beforePlaceholder: '\\[',
          afterPlaceholder: '\\]',
        },
        // Multiple placeholders
        {
          original: '{name} was born on {birthday}',
          expected: `${placeholders.name} was born on ${placeholders.birthday}`,
          beforePlaceholder: '\\{',
          afterPlaceholder: '\\}',
        },
        // Same placeholder, multiple times
        {
          original: ':name :name :name!!!',
          expected: `${placeholders.name} ${placeholders.name} ${placeholders.name}!!!`,
          beforePlaceholder: '\\:',
          afterPlaceholder: '',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => Utils.replacePlaceholders(
        info.original,
        placeholders,
        info.beforePlaceholder,
        info.afterPlaceholder
      ));
      // Then
      cases.forEach((info, index) => {
        expect(results[index]).toBe(info.expected);
      });
    });
  });

  describe('humanReadableList', () => {
    it('should format a list of strings into a human readable list', () => {
      // Given
      const cases = [
        {
          list: [],
          expected: '',
        },
        {
          list: ['a'],
          expected: 'a',
        },
        {
          list: ['a', 'b'],
          expected: 'a or b',
        },
        {
          list: ['a', 'b'],
          conjunction: 'and',
          expected: 'a and b',
        },
        {
          list: ['a', 'b', 'c'],
          expected: 'a, b or c',
        },
        {
          list: ['a', 'b', 'c'],
          conjunction: 'and',
          expected: 'a, b and c',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => {
        const caseArgs = [info.list];
        if (info.conjunction) {
          caseArgs.push(info.conjunction);
        }

        return Utils.humanReadableList(...caseArgs);
      });
      // Then
      results.forEach((result, index) => {
        expect(result).toBe(cases[index].expected);
      });
    });
  });

  describe('ensureExtension', () => {
    it('should ensure a file has a .js extension', () => {
      // Given
      const filename = 'myfile';
      const extension = 'ts';
      const filepath = `${filename}.${extension}`;
      let result = null;
      // When
      result = Utils.ensureExtension(filepath);
      // Then
      expect(result).toBe(`${filename}.js`);
    });

    it('should ensure a file has a .jsx extension', () => {
      // Given
      const directory = path.join('my', 'path', 'to');
      const filename = 'myfile';
      const extension = 'ts';
      const filepath = path.join(directory, `${filename}.${extension}`);
      let result = null;
      // When
      result = Utils.ensureExtension(filepath, 'jsx');
      // Then
      expect(result).toBe(path.join(directory, `${filename}.jsx`));
    });

    it('shouldn\'t change the extension if its alrady .js', () => {
      // Given
      const filename = 'myfile.js';
      let result = null;
      // When
      result = Utils.ensureExtension(filename);
      // Then
      expect(result).toBe(filename);
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    utils(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('utils');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBe(Utils);
  });
});
