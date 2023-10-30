const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");
import { existsSync } from "fs";

const exec = promisify(child_process.exec);

const csvFilePath = process.argv[3];
const baseDirectory = '/data2/Database/15k_read_spon_annotation';

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
    console.log(`Could'nt read the CSV file successfully\n `);
}

const fileNotFound = [
    { index: 0, fileName: "File Name"}
];

const resuldData = [
    { state: "State", district: "District", fileName: "File Name", fileLink: "File Link", duration: "Duration of audio(s)" }
];

function extractFileInfo(filename) {
    const parts = filename.split("_");
    const state = parts[0];
    const district = parts[1];
    const speakerID = parts[2];
    const utteranceID = parts[3].split("-")[0];
    const imageName = parts[4] !== "IMG" ? (parts[4].slice(0, 3) === "IMG" ? parts[4] : parts[4] + '_' + parts[5]) : parts[4] + '_' + parts[5] + '_' + parts[6];
    const secondLastNumber = parseInt(parts[parts.length - 2]);
    const lastNumber = parseInt(parts[parts.length - 1].slice(0, -4));
    console.log(parts[parts.length - 2], "-----", parts[parts.length - 1])
    const duration = (lastNumber - secondLastNumber) / 1000;
    console.log({ state, district, speakerID, utteranceID, imageName, duration })
    return { state, district, speakerID, utteranceID, imageName, duration };
}

function getFileLink(fileName) {
    const fileLocation = `combined/audios/${fileName}.wav`
    const encodedFileLocation = encodeURIComponent(fileLocation)
    const fileLink = `http://vaani.qc.artpark.in/single_audio/?a=${encodedFileLocation}`
    return fileLink;
}

async function locateFile(fileName) {
    if(existsSync(`/data2/data_nginx/single_audio/combined/audios/${fileName}.wav`)) {
        console.log(`File alreeady present in  : combined/audios/${fileName}.wav` )
        return `/data2/data_nginx/single_audio/combined/audios/${fileName}.wav`
    }
    console.log("Could'nt find the file in local directory")
    try {
        const output = await exec(`find ${baseDirectory} -print | grep -i ${fileName}`);
        console.log(output);
        const location = output.stdout.slice(0,-1);
        console.log("Copying the file", location)
        try {
            await exec(`cp ${location} /data2/data_nginx/single_audio/combined/audios`)
            console.log("Copy Completed");
        } catch(e) {
            console.log("Copy Failed with the error", e);
        }
        return location;
    } catch (e) {
        return false;
    }
}

for (const row of csvData) {
    const fileName = row[1];
    if (fileName != undefined) {
        const location = await locateFile(fileName);
        console.log("Location", location);
        if (location) {
            const { state, district, speakerID, utteranceID, imageName, duration } = extractFileInfo(fileName);
            const link = getFileLink(fileName);
            console.log({ state, district, duration, link});
            resuldData.push({ state: state, district: district, fileName: fileName, fileLink: link, duration: duration });
        }
        else{
            console.log("File Not found:", fileName);
            fileNotFound.push({index: fileNotFound.length ,fileName: fileName});
        }
    }
}

const fileNotFoundString = Papa.unparse(fileNotFound);
fs.writeFileSync(`/data2/data_nginx/single_audio/combined/notFoundImages/FileNotFound2.csv`, fileNotFoundString);

const resultDataString = Papa.unparse(resuldData);
fs.writeFileSync(`/data2/data_nginx/single_audio/combined/injestionCSV/filesFound2.csv`, resultDataString);