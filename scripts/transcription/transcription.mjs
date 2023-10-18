const { promisify } = require("util");
const fs = require('fs');
const Papa = require('papaparse');
const child_process = require("child_process");
import { existsSync, writeSync } from "fs";
import { exit } from "process";

const exec = promisify(child_process.exec);

const tsvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

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
const audioBaseLocation = `/data1/Database/raw/${vendor}_scripts/${vendor}_QC_SHARE_DATA/${batch}`;

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

function getFileLink(fileLocation) {
    const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
    const encodedFileLocation = encodeURIComponent(relevantFileLocation);
    const fileLink = `http://vaani.qc.artpark.in/transcription/?a=${encodedFileLocation}`;
    return fileLink;
}

async function checkAndCopyAudioFile(fileName) {
    if (!existsSync(`${audioLocation}/${fileName}`)) {
        //console.log(`Could'nt find the file ${fileName} in ${audioLocation}`)
        try {
            await exec(`scp -r ${audioBaseLocation}/${fileName} ${audioLocation}`)
            console.log(`Copied the file ${fileName}`)
            return true;
        } catch (e) {
            console.log("Error", e);
            return false;
        }
    }
    else {
        return true;
    }
}

// const newTsvArray = tsvArray.map(async (row, index) => {

//     const fileName = row[0];
//     if (index === 0) {
//         console.log("ROW", row);
//     }
//     if (fileName !== "") {
//         const { state, district, speakerID, utteranceID, imageName, duration } = extractFileInfo(fileName);
//         const checkAudioFile = await checkAndCopyAudioFile(fileName + ".wav");
//         if (!checkAudioFile) {
//             console.log("Audio not found");
//             fileNoteFound.push({ fileName: fileName });
//         }
//         else {
//             const link = getFileLink(audioLocation + fileName + ".wav");
//             console.log(link);
//             return [row[0], row[1], link, state, district];
//         }
//     }
// });

const newTsvArray = [];

for (let i = 0; i < tsvArray.length; i++) {
    const row = tsvArray[i];
    const fileDetails = row[0];
    let rowData = {};

    if (i > 0 && fileDetails !== "") {

        console.log("file details", typeof (fileDetails))
        const separatorIndex = fileDetails.lastIndexOf('/');
        const fileName = fileDetails.substring(separatorIndex + 1);
        console.log("File Name - ", fileName);

        const { state, district, speakerID, utteranceID, imageName, duration } = extractFileInfo(fileName);
        const checkAudioFile = await checkAndCopyAudioFile(fileName + ".wav");

        if (!checkAudioFile) {
            console.log("Audio not found");
            fileNoteFound.push({ fileName: fileName });
        } else {
            const fileLink = getFileLink(`${audioLocation}/${fileName}.wav`);
            console.log(fileLink);
            rowData["State"] = state;
            rowData["District"] = district;
            rowData["fileName"] = fileName;
            rowData["filelink"] = fileLink;
            rowData["duration"] = duration;
            rowData["Transcription"] = row[1];
            rowData["Does the transcribed text exactly match the audio? (Y/N)"] = "";
            rowData["If not, please type the correct transcription."] = "";
            console.log(rowData);
            newTsvArray.push(rowData);
        }
    }
}

const resultedCSV = Papa.unparse(newTsvArray, {
    delimiter: ",",
    header: true,
});

fs.writeFileSync(`${resultPath}/output_${vendor}.csv`, resultedCSV, 'utf-8');

if(fileNoteFound.length === 0) {
    const notFoundData = Papa.unparse(fileNoteFound, {
        delimiter: ",",
        header: true,
    });

    fs.writeFileSync(`${audioNotFound}/not_found_audios${vendor}.csv`, notFoundData, 'utf-8');
}

console.log("Output file created");