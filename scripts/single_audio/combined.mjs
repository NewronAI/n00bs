import { existsSync } from "fs"
import { clearScreenDown } from "readline";
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const csvFilePath = process.argv[3];
const baseDirectory = '/data/Database/manual_qc/SingleAudio_QC';

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  console.log(`Could'nt read the CSV file successfully\n `);
}

for(const row of csvData) {
    console.log(row);
    const fileName = row[1];
    if(fileName != undefined) {
        console.log("FileName", fileName);
    }
}
