const fs = require('fs');
const Papa = require('papaparse');

const csvFilename = process.argv[2];
console.log("Csv File Name",csvFilename)

const csvContents = fs.readFileSync(csvFilename, 'utf-8');
const { data: csvData } = Papa.parse(csvContents)

console.log(csvData)
const parts = csvData[0][1].split("/");
const vendor = parts[0];
const batchDate = parts[2];

if(csvFilename.slice(0,-3) !== "csv") {
    throw new Error(`File ${csvFilename} is not csv format`);
}

if(!existsSync(`/home/Anshul/files/videos/${vendor}/single_audios/${batchDate}`)) {
    await exec(`sudo mkdir /home/Anshul/files/videos/${vendor}/single_audios/${batchDate}`)
    console.log(`${batchDate} folder created in /home/Anshul/files/videos/${vendor}/single_audios/`)
} else {
    console.log(`Directory is already there /home/Anshul/files/videos/${vendor}/single_audios/${batchDate}`)
}

if(!existsSync(`/home/Anshul/files/${shaip}/single_audio/${batchDate}`)) {
    console.log(`Copying the audio files`)
    await exec(`rsync -avz -e "ssh -i $HOME/.ssh/id_rsa_ldai" artpark@34.93.48.56:/data/Database/manual_qc/${vendor}/single_audio/${batchDate} /home/Anshul/files/${vendor}/single_audio/${vendor}`)
} else {
    console.log("Audio files are already present")
}

if(!existsSync(`/home/Anshul/Logs/ImageNotFound/${batchDate}_${vendor}`)) {
    console.log(`Creating the directory /home/Anshul/Logs/ImageNotFound/${batchDate}_${vendor}`)
}

// Define the data to be saved in the JSON file
let data = {
    "baseLocation": "/home/Anshul/files",
    "imagesDirPath": "/home/Anshul/files/images/Images_Mar23",
    "videosDirPath": `/home/Anshul/files/videos/${vendor}/${batchDate}`,
    "csvFilePath" : csvFilename,
    "imageNotFoundDataCsvPath" : `/home/Anshul/Logs/ImageNotFound/${batchDate}_${vendor}`,
    "logsPath" : "/home/Anshul/Logs"
}

// Define the filename for the JSON file
const filename = `${batchDate}_${vendor}_config.json`;

// Create the JSON file
console.log("Creating Config file")
fs.writeFile(filename, JSON.stringify(data), err => {
  if (err) throw err;
  console.log('JSON file has been saved!');
});
