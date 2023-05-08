#!/usr/bin/env zx

import { existsSync, readXlsxFile } from "fs";
import { dirname, extname, join } from "path";
import { unparse as PapaUnparse } from "papaparse";

const args = process.argv.slice(2);

// Check if an XLSX file path and output directory path were provided as input
if (args.length !== 2) {
  console.error("Please provide the path to an XLSX file and the output directory path as input.");
  process.exit(1);
}

const xlsxPath = args[0];
const outputDir = args[1];

// Check if the input file exists
if (!existsSync(xlsxPath)) {
  console.error(`The file ${xlsxPath} does not exist.`);
  process.exit(1);
}

// Read the XLSX file into a 2D array
const { data } = await readXlsxFile(xlsxPath);

// Convert the 2D array to a CSV string using PapaParse
const csvStr = PapaUnparse(data);

// Write the CSV string to a file in the output directory with the same name as the XLSX file, but with a .csv extension
const csvFilename = `${basename(xlsxPath, extname(xlsxPath))}.csv`;
const csvPath = join(outputDir, csvFilename);
await $`echo ${csvStr} > ${csvPath}`;

console.log(`Successfully converted ${xlsxPath} to ${csvPath}`);
