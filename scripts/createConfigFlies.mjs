const fs = require('fs');
const Papa = require('papaparse');

const csvFilename = process.argv[2];

const csvContents = fs.readFileSync(csvFilename, 'utf-8');
const { data: csvData } = Papa.parse(csvContents)

const parts = csvData[0][1].split("/");
const vendor = parts[0];
const batchDate = parts[2];

if(!existsSync(`/home/Anshul/files/videos/${vendor}/single_audios/${batchDate}`)) {
    await exec(`sudo mkdir /home/Anshul/files/videos/${vendor}/single_audios/${batchDate}`)
}

if(!existsSync(`/home/Anshul/files/${shaip}/single_audio/${batchDate}`)) {
    await exec(`rsync -avz -e "ssh -i $HOME/.ssh/id_rsa_ldai" artpark@34.93.48.56:/data/Database/manual_qc/${vendor}/single_audio/${batchDate} /home/Anshul/files/${vendor}/single_audio/${vendor}`)
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
const filename = 'data.json';

// Create the JSON file
fs.writeFile(filename, JSON.stringify(data), err => {
  if (err) throw err;
  console.log('JSON file has been saved!');
});
