import fs from 'fs';
import path from 'path';
import papa from 'papaparse';

const csvFilePath = process.argv[3];
const baseDirectory = '/data/Database/manual_qc/SingleAudio_QC';

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  console.log(`Could'nt read the CSV file successfully\n `);
}

for(row in csvData) {
    const fileName = row[1];
    if(fileName != undefined) {
        console.log("FileName", fileName);
    }
}
