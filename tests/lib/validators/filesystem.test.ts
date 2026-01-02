import fs from 'fs/promises';
import path from 'path';
import { fileExists, directoryExists, isReadable, isWritable } from '@lib/validators/filesystem';

describe('Filesystem Validators', () => {
  // Setup temporary test files and directories
  const testDir = path.resolve(__dirname, 'test-temp');
  const testFile = path.join(testDir, 'file.txt');
  const unreadableFile = path.join(testDir, 'unreadable.txt');
  const unwritableFile = path.join(testDir, 'unwritable.txt');
  const testSubDir = path.join(testDir, 'subdir');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'test content');
    await fs.mkdir(testSubDir, { recursive: true });
    await fs.writeFile(unreadableFile, 'cannot read this');
    await fs.writeFile(unwritableFile, 'cannot write this');

    // Set unreadable file permissions (remove read)
    await fs.chmod(unreadableFile, 0o222); // write-only
    // Set unwritable file permissions (remove write)
    await fs.chmod(unwritableFile, 0o444); // read-only
  });

  afterAll(async () => {
    // Restore permissions to allow cleanup
    await fs.chmod(unreadableFile, 0o666);
    await fs.chmod(unwritableFile, 0o666);
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('fileExists', () => {
    const validator = fileExists();

    test('validates existing file', async () => {
      await expect(validator.validate(testFile)).resolves.toBe(true);
    });

    test('rejects non-existent file', async () => {
      await expect(validator.validate(path.join(testDir, 'nofile.txt'))).resolves.toBe(false);
    });

    test('rejects directory path', async () => {
      await expect(validator.validate(testSubDir)).resolves.toBe(false);
    });

    test('validates array of files', async () => {
      await expect(validator.validate([testFile])).resolves.toBe(true);
      await expect(validator.validate([testFile, path.join(testDir, 'nofile.txt')])).resolves.toBe(
        false
      );
    });

    test('has default message', () => {
      expect(validator.message).toBe('The specified file does not exist or is not a file.');
    });

    test('allows custom message', () => {
      const custom = fileExists({ message: 'Custom file exists message' });
      expect(custom.message).toBe('Custom file exists message');
    });
  });

  describe('directoryExists', () => {
    const validator = directoryExists();

    test('validates existing directory', async () => {
      await expect(validator.validate(testSubDir)).resolves.toBe(true);
    });

    test('rejects non-existent directory', async () => {
      await expect(validator.validate(path.join(testDir, 'nodir'))).resolves.toBe(false);
    });

    test('rejects file path', async () => {
      await expect(validator.validate(testFile)).resolves.toBe(false);
    });

    test('validates array of directories', async () => {
      await expect(validator.validate([testSubDir])).resolves.toBe(true);
      await expect(validator.validate([testSubDir, path.join(testDir, 'nodir')])).resolves.toBe(
        false
      );
    });

    test('has default message', () => {
      expect(validator.message).toBe(
        'The specified directory does not exist or is not a directory.'
      );
    });

    test('allows custom message', () => {
      const custom = directoryExists({ message: 'Custom directory exists message' });
      expect(custom.message).toBe('Custom directory exists message');
    });
  });

  describe('isReadable', () => {
    const validator = isReadable();

    test('validates readable file', async () => {
      await expect(validator.validate(testFile)).resolves.toBe(true);
    });

    test('rejects unreadable file', async () => {
      await expect(validator.validate(unreadableFile)).resolves.toBe(false);
    });

    test('rejects non-existent path', async () => {
      await expect(validator.validate(path.join(testDir, 'nofile.txt'))).resolves.toBe(false);
    });

    test('validates array of readable paths', async () => {
      await expect(validator.validate([testFile])).resolves.toBe(true);
      await expect(validator.validate([testFile, unreadableFile])).resolves.toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('The specified path is not readable.');
    });

    test('allows custom message', () => {
      const custom = isReadable({ message: 'Custom readable message' });
      expect(custom.message).toBe('Custom readable message');
    });
  });

  describe('isWritable', () => {
    const validator = isWritable();

    test('validates writable file', async () => {
      await expect(validator.validate(testFile)).resolves.toBe(true);
    });

    test('rejects unwritable file', async () => {
      await expect(validator.validate(unwritableFile)).resolves.toBe(false);
    });

    test('rejects non-existent path', async () => {
      await expect(validator.validate(path.join(testDir, 'nofile.txt'))).resolves.toBe(false);
    });

    test('validates array of writable paths', async () => {
      await expect(validator.validate([testFile])).resolves.toBe(true);
      await expect(validator.validate([testFile, unwritableFile])).resolves.toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('The specified path is not writable.');
    });

    test('allows custom message', () => {
      const custom = isWritable({ message: 'Custom writable message' });
      expect(custom.message).toBe('Custom writable message');
    });
  });
});
