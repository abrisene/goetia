/*
 # file.test.js
 # File Functions Spec
 */

/**
 # Module Dependencies
 */

// import { writeFileSync, writeSync } from 'fs';
import { join } from 'path';
import { Element } from 'xml-js';
import { makeDir, removeDir, importXML, exportXML, importJSON, exportJSON, exists } from '../file';

/**
 # Constants
 */

const TEST_DIR = join(__dirname, '../../data/tests');
const IMPORT_DIR = join(__dirname, '../../data/tests/import');
const EXPORT_DIR = join(__dirname, '../../data/tests/export');

/**
 # Utility Functions
 */

function getDirs(name: string, outName = name, outDir = EXPORT_DIR, inDir = IMPORT_DIR) {
  return {
    inDir: {
      _: join(inDir, name),
      XML: join(inDir, `${name}.xml`),
      JSON: join(inDir, `${name}.json`),
    },
    outDir: {
      _: join(outDir, outName),
      rawXML: join(outDir, `${outName}.xml`),
      rawJSON: join(outDir, `${outName}.json`),
    },
  };
}

/**
 # Tests
 */
try {
  describe('[FL] Directory Utilities', () => {
    const dirName = 'test_dir';
    const createLoc = join(TEST_DIR, dirName);
    it('can create directories', async () => {
      const createLoc = await makeDir(TEST_DIR, dirName);
      expect(await exists(createLoc)).toBe(true);
    });
    it('can remove directories', async () => {
      const rmLoc = await removeDir(TEST_DIR, dirName);
      expect(await exists(createLoc)).toBe(false);
      expect(rmLoc).toBe(TEST_DIR);
    });
  });

  describe('[FL] XML File Loader', () => {
    const { inDir, outDir } = getDirs('u1', 'fl_u1');
    it('can load XML files', async () => {
      const xml = await importXML(inDir.XML);
    });
    it('can export XML files', async () => {
      const xml: Element = await importXML(inDir.XML);
      await exportXML(join(outDir.rawXML), xml);
      expect(await exists(outDir.rawXML)).toBe(true);
    });
    it('can export JSON files', async () => {
      const xml: Element = await importXML(inDir.XML);
      await exportJSON(outDir.rawJSON, xml, true);
      expect(await exists(outDir.rawJSON)).toBe(true);
    });
  });
} catch (err) {
  console.error(err);
}
