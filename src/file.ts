/*
 # file.ts
 # File System Utilities
 */

/**
 # Module Dependencies
 */

import { existsSync, readFileSync, writeFileSync, PathLike } from 'fs';
import * as XLSX from 'xlsx';
import { xml2json, js2xml, Element, ElementCompact, Options } from 'xml-js';

/**
 # Types
 */

type ImportFn<T> = (loc: PathLike | string) => T;

/**
 # Constants
 */

const handlers = {
  import: {
    json: importJSON,
    xlsx: importXLSX,
    // xls: importXLS,
    csv: importCSV,
    // tsv: importTSV,
    // yml: importYML,
    // yaml: importYAML,
    xml: importXML,
    txt: importTXT,
    // js: 'x',
  },
  export: {
    json: exportJSON,
    xlsx: exportXLSX,
    // xls: exportXLS,
    // csv: exportCSV,
    // tsv: exportTSV,
    // yml: exportYML,
    // yaml: exportYAML,
    // xml: exportXML,
    txt: exportTXT,
    // js: 'x',
  },
};

/**
 # Functions
 */

function getExtension(filename: string) {
  return filename.split('.').pop();
}

function jsonTryParse(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
}

/**
 * STANDARD FS
 */

export async function exists(loc: PathLike) {
  return existsSync(loc);
}

/**
 * META FUNCTIONS
 */

async function importHarness<T>(loc: PathLike, importFn: ImportFn<T>) {
  if (await exists(loc)) {
    return importFn(loc);
  } else {
    throw new Error(`File does not exist: ${loc}`);
  }
}

/**
 * JSON
 */

/**
 * Imports a JSON File
 * @param loc  Path to JSON file
 * @returns JSON object
 */
export async function importJSON<T>(loc: PathLike): Promise<T> {
  return importHarness(loc, loc => jsonTryParse(readFileSync(loc, 'utf8')));
}

/**
 * Exports a JSON File
 * @param loc Path to JSON file.
 * @param data JSON object.
 * @param readable Whether or not to format the file for human readability.
 */
export async function exportJSON(loc: string, data: unknown, readable = false) {
  return writeFileSync(loc, JSON.stringify(data, null, readable ? 2 : 0));
}

/**
 * XLSX
 */

interface XLSXJSON<T> {
  [key: string]: T | unknown;
}

/**
 * Imports an XLSX File
 * @param loc Path to XLSX file
 * @param json Whether to return JSON object
 * @returns A XLSX Workbook or a JSON object { [key: sheet]: data }.
 */
export async function importXLSX<T>(loc: string, json = true) {
  const workbook = await importHarness(loc, loc => XLSX.readFile(loc.toString()));
  let result: XLSX.WorkSheet | XLSXJSON<T>;
  if (json) {
    const { Sheets } = workbook;
    result = Object.keys(Sheets).reduce((l, key) => {
      l[key] = XLSX.utils.sheet_to_json(Sheets[key]);
      return l;
    }, {} as XLSXJSON<T>);
  } else {
    result = workbook;
  }
  return result;
}

/**
 * Exports an XLSX File
 * @param loc Path to XLSX file
 * @param data Data to write to XLSX file
 */
export async function exportXLSX(loc: string, data: any) {
  return writeFileSync(loc, XLSX.write(data, { bookType: 'xlsx', type: 'binary' }));
}

/**
 * CSV
 */

/**
 * Imports a CSV File
 * @param loc Path to CSV file
 * @returns CSV data as an array of arrays
 */
// TODO: Implement Header Mapping
export async function importCSV(loc: string) {
  return importHarness(loc, loc => {
    const data = readFileSync(loc, 'utf8');
    return data.split('\n').map(line => line.split(','));
  });
}

/* export async function exportCSV(loc: string, data: Dictionary<any>) {
  return writeFileSync(loc, data.map(line => line.join(',')).join('\n'));
} */

/**
 * XML
 */

const defaultOptsXML: Options.XML2JSON = {
  compact: false,
  addParent: true,
  nativeType: true,
  // nativeTypeAttributes: true,
};

/**
 * Imports an XML File
 * @param loc Path to XML file
 * @param options Options for xml2json
 * @returns JSON object
 */
export async function importXML(loc: string, options: Options.XML2JSON = defaultOptsXML) {
  return importHarness(loc, loc => {
    const data = readFileSync(loc, 'utf8');
    return JSON.parse(xml2json(data, options)) as Element;
  });
}

/**
 * Exports an XML File
 * @param loc Path to XML file
 * @param data JSON object
 */
export async function exportXML(loc: string, data: Element | ElementCompact) {
  return writeFileSync(loc, js2xml(data, defaultOptsXML as Options.JS2XML));
}

/**
 * TXT
 */

/**
 * Imports a TXT File
 * @param loc Path to TXT file
 * @returns TXT Data
 */
export function importTXT(loc: string) {
  return importHarness(loc, loc => readFileSync(loc, 'utf8'));
}

export function exportTXT(loc: string, data: string) {
  return writeFileSync(loc, data);
}
