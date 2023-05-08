#!/usr/bin/env zx
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
const [_, __, inputPath, outputPath] = process.argv;

if (!$`test -f ${inputPath}`) {
  console.error('Error: Input path not found');
  process.exit(1);
}

if (!$`test -f ${outputPath}`) {
  console.error(`Error: Outout path not found : ${inputPath}`);
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
