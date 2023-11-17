import { existsSync } from "fs"
import { clearScreenDown } from "readline";
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");
const exec = promisify(child_process.exec);

const csvFilePath = process.argv[3];
const resultPath = process.argv[4];

if (!existsSync(csvFilePath)) {
    console.log("Can't find the the CSV.")
    exit(0)
}

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  console.log("Could'nt read the CSV file successfully.")
}

const resuldData = [];

async function checkFile (filePath) {
    if (existsSync(filePath)) {
        return true;
    } else{
        return false
    }
}

function getFileLink(fileLocation, imageLocation) {
    const encodedFileLocation = encodeURIComponent(fileLocation.split("/").slice(4).join("/"));
    const encodedImageLocation = encodeURIComponent(imageLocation.split("/").slice(4).join("/"));
    if(fileLocation === "NULL") {
        return `http://vaani.qc.artpark.in/iisc/?i=${encodedImageLocation}`;
    }
    if(imageLocation === "NULL") {
        return `http://vaani.qc.artpark.in/iisc/?a=${encodedFileLocation}`;
    }
    return `http://vaani.qc.artpark.in/iisc/?a=${encodedFileLocation}&i=${encodedImageLocation}`;
}

for(const row of csvData) {
    const audioLocation = row[0];
    const imageLocation = row[1];

    let checkAudio = true, checkImage = true;

    if (audioLocation !== "NULL") {
        checkAudio = await checkFile(audioLocation);
    }

    if (imageLocation !== "NULL") {
        checkAudio = await checkFile(imageLocation);
    }

    if(checkAudio && checkImage) {
        const link = getFileLink(audioLocation,imageLocation)
        console.log(link);
        resuldData.push({ "Audio Path":audioLocation, "Image Path":imageLocation, "Link": link})
    }
    else if(checkAudio === false) {
        console.log("Can't find the audio file", audioLocation);
    }
    else if(checkImage === false) {
        console.log("Can't find the Image file", imageLocation);
    }
}

const fileName = csvFilePath.split('/').pop().slice(0,-4);
const resultDataString = Papa.unparse(resuldData);
fs.writeFileSync(`${resultPath}/${fileName}_links.csv`, resultDataString);
console.log("Link CSV Created");