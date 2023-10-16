const { promisify } = require("util");
const fs = require('fs');
const Papa = require('papaparse');
const child_process = require("child_process");
import { existsSync, writeSync } from "fs";
import { exit } from "process";

const exec = promisify(child_process.exec);

const tsvFilename = process.argv[3];
// const batch = process.argv[4];
// const vendor = process.argv[5];

console.log("Started");

if (tsvFilename.slice(-3) !== "tsv") {
    throw new Error(`File ${tsvFilename} is not tsv format.`);
}

console.log("Input file is in .tsv format");

const tsvData = fs.readFileSync(tsvFilename, 'utf-8');

console.log(tsvData);

const tsvArray = Papa.parse(tsvData, {
    delimiter: "\t",
    header: false,
}).data;

function getFileLink(fileLocation) {
    //console.log("fileDetails", fileLocation)
    const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
    //console.log("File Locaton Given", relevantFileLocation);
    const encodedFileLocation = encodeURIComponent(relevantFileLocation);
    const fileLink = `http://vaani.qc.artpark.in/transcription/?a=${encodedFileLocation}`;
    return fileLink;
}

const newTsvArray = tsvArray.map((row, index) => {
    if(index === 0) {
        console.log("ROW", row);
    }
    const fileName = row[0];
    const link = getFileLink(fileName);
    return [row[0], row[1], link];
});

console.log("new Tsv Array Created");

const resultedCSV = Papa.unparse(newTsvArray, {
    delimiter: ",",
    header: true,
});

fs.writeFileSync("/mnt/c/Users/anshu/Downloads/output.csv", resultedCSV, 'utf-8');

console.log("Output file created");