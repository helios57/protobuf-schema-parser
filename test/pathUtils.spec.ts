import {Path} from '../src/pathUtils';

describe('Path.isAbsolute()', function () {
  it.each([
    ['/etc/proto', true],
    ['C:/protos', true],
    ['\\\\server\\share', true],
    ['relative/path.proto', false],
    ['./relative.proto', false],
    ['../sibling.proto', false],
    ['', false],
  ])('should classify %p as absolute=%p', function (path, expected) {
    expect(Path.isAbsolute(path)).toBe(expected);
  });
});

describe('Path.normalize()', function () {
  it.each([
    ['a/b/c.proto', 'a/b/c.proto'],
    ['a\\b\\c.proto', 'a/b/c.proto'],
    ['a//b///c.proto', 'a/b/c.proto'],
    ['a/./b/c.proto', 'a/b/c.proto'],
    ['a/b/../c.proto', 'a/c.proto'],
    ['a/b/../../c.proto', 'c.proto'],
    ['./a/b.proto', 'a/b.proto'],
  ])('should normalize %p to %p', function (path, expected) {
    expect(Path.normalize(path)).toBe(expected);
  });

  it('should keep a leading segment of an absolute path', function () {
    expect(Path.normalize('/a/b/../c.proto')).toBe('/a/c.proto');
  });

  it('should drop a parent segment that would escape an absolute path', function () {
    expect(Path.normalize('/../a.proto')).toBe('/a.proto');
  });

  it('should keep a parent segment that escapes a relative path', function () {
    expect(Path.normalize('../a.proto')).toBe('../a.proto');
    expect(Path.normalize('../../a.proto')).toBe('../../a.proto');
  });

  it('should preserve a UNC prefix', function () {
    expect(Path.normalize('\\\\server\\share\\a\\..\\b.proto')).toBe('\\\\server/share/b.proto');
  });
});

describe('Path.resolve()', function () {
  it('should resolve an include relative to the directory of the origin file', function () {
    expect(Path.resolve('a/b/origin.proto', 'include.proto')).toBe('a/b/include.proto');
  });

  it('should resolve a parent reference in the include', function () {
    expect(Path.resolve('a/b/origin.proto', '../include.proto')).toBe('a/include.proto');
  });

  it('should return an absolute include unchanged', function () {
    expect(Path.resolve('a/b/origin.proto', '/absolute/include.proto')).toBe('/absolute/include.proto');
  });

  it('should return the include unchanged when the origin has no directory', function () {
    expect(Path.resolve('origin.proto', 'include.proto')).toBe('include.proto');
  });

  it('should skip normalization when the caller declares the paths normalized', function () {
    expect(Path.resolve('a/b/origin.proto', 'include.proto', true)).toBe('a/b/include.proto');
  });
});
