#!/usr/bin/env zx
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
const [_, __, inputPath, outputPath] = process.argv;

if (!inputPath.endsWith('.xlsx')) {
  console.error('Error: Invalid input file format. Only .xlsx files are supported.');
  process.exit(1);
}

if (!$`test -f ${inputPath}`) {
  console.error(`Error: Input file not found at path: ${inputPath}`);
  process.exit(1);
}

function convertXlsxToCsv(inputFolderPath, outputFolderPath) {
  const files = fs.readdirSync(inputFolderPath);
  for (const file of files) {
    const inputFile = path.join(inputFolderPath, file);
    if (fs.statSync(inputFile).isFile() && path.extname(inputFile) === '.xlsx') {
      const workbook = xlsx.readFile(inputFile);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csvData = xlsx.utils.sheet_to_csv(sheet);
      const outputFileName = path.basename(inputFile, '.xlsx') + '.csv';
      const outputFile = path.join(outputFolderPath, outputFileName);
      fs.writeFileSync(outputFile, csvData);
    }
  }
}

// example usage
convertXlsxToCsv(inputPath, outputPath);
