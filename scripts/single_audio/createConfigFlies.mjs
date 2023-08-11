const { promisify } = require("util");
const fs = require('fs');
const Papa = require('papaparse');
const child_process = require("child_process");
import { existsSync } from "fs";

const csvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

const exec = promisify(child_process.exec);

if(csvFilename.slice(-3) !== "csv") {
    throw new Error(`File ${csvFilename} is not csv format. The format is ${csvFilename.slice(0,-3)}`);
}

const csvContents = fs.readFileSync(csvFilename, 'utf-8');
const { data: csvData } = Papa.parse(csvContents)

console.log(csvData);

if(!existsSync(`/data2/data_nginx/single_audio/${vendor}/audios/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/single_audio/${vendor}/audios/${batch}`)
    console.log(`${batch} folder created in /data2/data_nginx/single_audio/${vendor}/audios/${batch}`)
} else {
    console.log(`Directory is already there /data2/data_nginx/single_audio/${vendor}/audios/${batch}`)
}

// if(!existsSync(`/home/Anshul/files/${vendor}/single_audio/${batchDate}`)) {
//     console.log(`Copying the audio files`)
//     await exec(`rsync -avz -e "ssh -i $HOME/.ssh/id_rsa_ldai" artpark@34.93.48.56:/data/Database/manual_qc/${vendor}/single_audio/${batchDate} /home/Anshul/files/${vendor}/single_audio/${vendor}`)
// } else {
//     console.log("Audio files are already present")
// }

if(!existsSync(`/data2/data_nginx/single_audio/${vendor}/notFoundImages/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/single_audio/${vendor}/notFoundImages/${batch}`)
    console.log(`Created Folder /data2/data_nginx/single_audio/${vendor}/notFoundImages/${batch}`)
}

if(!existsSync(`/data2/data_nginx/single_audio/${vendor}/injestionCSV/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/single_audio/${vendor}/injestionCSV/${batch}`)
    console.log(`Created the directory /data2/data_nginx/single_audio/${vendor}/injestionCSV/${batch}`)
}

if(!existsSync(`/data2/data_nginx/single_audio/${vendor}/logs/${batch}`)) {
    await exec(`mkdir /data2/data_nginx/single_audio/${vendor}/logs/${batch}`)
    console.log(`Created the directory /data2/data_nginx/single_audio/${vendor}/logs/${batch}`)
}

let data = {
    "vendor": vendor,
    "batch": batch,
    "baseLocation": "/data2/data_nginx/single_audio",
    "audioLocation": `/data2/data_nginx/single_audio/${vendor}/audios/${batch}`,
    "baseAudioLocation": `/data/Database/manual_qc/SingleAudio_QC/${vendor}/${batch}/Audios`,
    "imagesDirPath": "/data2/data_nginx/single_audio/Images/Images_Mar23",
    "csvFilePath" : csvFilename,
    "imageNotFoundDataCsvPath" : `/data2/data_nginx/single_audio/${vendor}/notFoundImages/${batch}`,
    "logsPath" : `/data2/data_nginx/single_audio/${vendor}/logs/${batch}`,
    "resultCSV" : `/data2/data_nginx/single_audio/${vendor}/injestionCSV/${batch}`
}

// Define the filename for the JSON file
const filename = `${batch}_${vendor}_config.json`;

// Create the JSON file
console.log("Creating Config file")
fs.writeFile(`/data2/data_nginx/single_audio/${vendor}/configFiles/${filename}`, JSON.stringify(data), err => {
  if (err) throw err;
  console.log('JSON file has been saved!');
});
