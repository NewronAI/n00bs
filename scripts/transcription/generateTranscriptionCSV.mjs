const { promisify } = require("util");
const fs = require('fs');
const Papa = require('papaparse');
const child_process = require("child_process");
import { existsSync } from "fs";
import { exit } from "process";

const exec = promisify(child_process.exec);

const csvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

if (csvFilename.slice(-3) !== "csv") {
    throw new Error(`File ${csvFilename} is not csv format. The format is ${csvFilename.slice(0, -3)}`);
}

const csvContents = fs.readFileSync(csvFilename, 'utf-8');
const { data: csvData } = Papa.parse(csvContents)

if (csvData === null) {
    //console.log("Could'nt read the CSV file successfully.");
    exit(1)
    //logStream.write(`Could'nt read the CSV file successfully\n `);
}

if (!existsSync(`/data2/data_nginx/transcription/${vendor}/audios/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/transcription/${vendor}/audios/${batch}`)
    //console.log(`${batch} folder created in /data2/data_nginx/transcription/${vendor}/audios/${batch}`)
} else {
    //console.log(`Directory is already there /data2/data_nginx/transcription/${vendor}/audios/${batch}`)
}

if (!existsSync(`/data2/data_nginx/transcription/${vendor}/injestionCSV/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/transcription/${vendor}/injestionCSV/${batch}`)
    //console.log(`Created the directory /data2/data_nginx/transcription/${vendor}/injestionCSV/${batch}`)
}

const baseLocation = "/data2/data_nginx/transcription";
const audioLocation = `/data2/data_nginx/transcription/${vendor}/audios/${batch}`;
const audioNotFound = `/data2/data_nginx/transcription/${vendor}/notFoundFiles/${batch}`;
const resultPath = `/data2/data_nginx/transcription/${vendor}/injestionCSV/${batch}`;
const audioBaseLocation = `artpark_user5@34.93.122.66:/home/check_instance/Transcription_QC/${vendor}/${batch}`;

const resuldData = [];
const fileNoteFound = [];

function extractFileInfo(filename) {
    const parts = filename.split("_");
    const state = parts[0];
    const district = parts[1];
    const speakerID = parts[2];
    const utteranceID = parts[3].split("-")[0];
    const imageName = parts[4] !== "IMG" ? (parts[4].slice(0, 3) === "IMG" ? parts[4] : parts[4] + '_' + parts[5]) : parts[4] + '_' + parts[5] + '_' + parts[6];
    const secondLastNumber = parseInt(parts[parts.length - 2]);
    const lastNumber = parseInt(parts[parts.length - 1].slice(0, -4));
    //console.log(parts[parts.length - 2], "-----", parts[parts.length - 1])
    const duration = (lastNumber - secondLastNumber) / 1000;
    //console.log({ state, district, speakerID, utteranceID, imageName, duration })
    return { state, district, speakerID, utteranceID, imageName, duration };
}

async function checkAndCopyAudioFile(fileName) {
    if (!existsSync(`${audioLocation}/${fileName}`)) {
        //console.log(`Could'nt find the file ${fileName} in ${audioLocation}`)
        try {
            await exec(`scp -r -i "/home/artpark_user1/.ssh/id_rsa" ${audioBaseLocation}/${fileName} ${audioLocation}`)
            //console.log(`Copied the file ${fileName}`)
            return true;
        } catch (e) {
            //console.log("Error", e)
            return false;
        }
    }
    else {
        return true;
    }
}

function getImageName(filename) {
    const parts = filename.split("_");
    let imageName = "";
    for (let i = 0; i < parts.length; i++) {
        if (i >= 4 && i < (parts.length - 2)) {
            imageName = imageName + "_" + parts[i];
        }
    }
    //console.log("Image Name :", imageName.slice(1));
    return imageName.slice(1);
}

function getFileLink(fileLocation) {
    //console.log("fileDetails", fileLocation)
    const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
    //console.log("File Locaton Given", relevantFileLocation);
    const encodedFileLocation = encodeURIComponent(relevantFileLocation)
    const fileLink = `http://vaani.qc.artpark.in/single_audio/?a=${encodedFileLocation}`
    return fileLink;
}

for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const fileDetails = row[0];
    console.log("file details", fileDetails)
    let rowData = {};

    if (i > 0 && fileDetails != undefined) {
        // Skip the execution for the first element
        //console.log(`Working on this audio file ${fileDetails} \n `);

        const separatorIndex = fileDetails.lastIndexOf('/');
        const fileName = fileDetails.substring(separatorIndex + 1);
        //console.log("File Name", fileName);

        const { state, district, speakerID, utteranceID, imageName, duration } = extractFileInfo(fileName);

        const checkAudioFile = await checkAndCopyAudioFile(fileName + ".wav");

        if (!checkAudioFile) {
            //console.log("Audio not found");
            fileNoteFound.push({ fileName: fileName });
        } else {
            const fileLink = getFileLink(`${audioLocation}/${fileName}.wav`);
            //console.log(fileLink);
            rowData = { state: state, district: district, fileName: fileName, fileLink: fileLink, duration: duration };
        }
    }

    rowData["transcription"] = row[1];
    rowData["q1"] = "";
    rowData["q2"] = "";
    resuldData.push(rowData);
}


const lastIndex = csvFilePath.lastIndexOf('/');
const csvFileName = csvFilePath.slice(lastIndex + 1, -4);

if (fileNoteFound != []) {
    if (!existsSync(`/data2/data_nginx/transcription/${vendor}/notFoundFiles/${batch}`)) {
        await exec(`mkdir /data2/data_nginx/transcription/${vendor}/notFoundFiles/${batch}`)
        //console.log(`Created Folder /data2/data_nginx/transcription/${vendor}/notFoundFiles/${batch}`)
    }

    const audioNotFoundString = Papa.unparse(fileNoteFound);
    fs.writeFileSync(`${audioNotFound}/${csvFileName}_audio_not_found.csv`, audioNotFoundString);
}

//console.log("Creating resultant csv");
const resultDataString = Papa.unparse(resuldData);
fs.writeFileSync(`${resultPath}/${csvFileName}_${vendor}.csv`, resultDataString);
//console.log("Created");