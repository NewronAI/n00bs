const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const exec = promisify(child_process.exec);

const csvFilePath = process.argv[3];
const baseDirectory = '/data/Database/manual_qc/SingleAudio_QC';

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  console.log(`Could'nt read the CSV file successfully\n `);
}

async function locateFile(fileName) {
    try {
        const location = await exec(`find ${baseDirectory} -print | grep -i ${fileName}`);
        return location.stdout;
    } catch(e) {
        return false;
    }
}

for(const row of csvData) {
    const fileName = row[1];
    if(fileName != undefined) {
        const location = await locateFile(fileName);
        console.log("Location", location);
    }
}
