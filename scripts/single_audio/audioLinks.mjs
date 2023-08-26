import { existsSync } from "fs"
import { clearScreenDown } from "readline";
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const configFile = process.argv[3];
console.log(configFile)
//const configFilePath = path.join(__dirname, configFile);
const config = JSON.parse(fs.readFileSync(configFile));

const logsPath = config.logsPath;
const baseLocation = config.baseLocation;
const csvFilePath = config.csvFilePath;
const audioLocation = config.audioLocation;
const resultPath = config.resultCSV;
const vendor = config.vendor;
const batch = config.batch;
const audioBaseLocation = config.baseAudioLocation;
const imageNotFoundDataCsvPath = config.imageNotFoundDataCsvPath;

const now = new Date();
const logFileName = `${logsPath}/log-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.txt`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });
logStream.write('Started running the script\n');

// const readdir = promisify(fs.readdir);
const exec = promisify(child_process.exec);

logStream.write('Getting Directories location from config file\n');
logStream.write(`Base Location is ${baseLocation}\n`);
logStream.write(`CSV File Path is ${csvFilePath}\n`);
logStream.write(`Base Dir Audio Path is ${audioBaseLocation}\n`);
logStream.write(`Audio Path is ${audioLocation}\n`);

console.log('Getting Directories location from config file\n');
console.log(`Base Location is ${baseLocation}\n`);
console.log(`CSV File Path is ${csvFilePath}\n`);

const filenotFound = [];

const resuldData = [
  {fileName: "File Name", fileLink: "File Link"}
];

async function checkAndCopyAudioFile(fileName) {
  if (!existsSync(`${audioLocation}/${fileName}`)) {
    console.log(`Could'nt find the file ${fileName} in ${audioLocation}`)
    try {
      await exec(`scp -r ${audioBaseLocation}/${fileName} ${audioLocation}`)
      console.log(`Copied the file ${fileName}`)
      return true;
    }catch (e) {
     console.log("Error", e)
     return false;
    }
  }
  else {
    return true;
  }
}

function getFileLink(fileLocation) {
  console.log("fileDetails", fileLocation)
  const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
  console.log("File Locaton Given", relevantFileLocation);
  const encodedFileLocation = encodeURIComponent(relevantFileLocation + ".wav")
  const fileLink = `http://vaani.qc.artpark.in/single_audio/?a=${encodedFileLocation}`
  return fileLink;
}

logStream.write(`Reading CSV file located in ${csvFilePath} \n `);
const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  logStream.write(`Could'nt read the CSV file successfully\n `);
}
logStream.write(`Read CSV file successfully\n `);

for (const row of csvData) {

  const fileDetails = row[1]

  if (fileDetails !== undefined) {
    logStream.write(`Working on this audio file ${fileDetails} \n `);

    const separatorIndex = fileDetails.lastIndexOf('/');
    const fileName = fileDetails.substring(separatorIndex + 1);
    console.log("File Name", fileName);

    const checkAudioFile = await checkAndCopyAudioFile(fileName + ".wav")

    console.log("checkAudioFile", checkAudioFile);

    if (checkAudioFile) {
      const fileLink = getFileLink(`${audioLocation}/${fileName}`)
      console.log(fileLink)
      resuldData.push({fileName: fileName, fileLink: fileLink})
    }
    else {
      filenotFound({fileName: fileName});
    }
  }
}

const filenotFoundString = Papa.unparse(filenotFound);
fs.writeFileSync(`${imageNotFoundDataCsvPath}/AudiosNotFound-${vendor}-${batch}.csv`, filenotFoundString);

console.log("Creating resultant csv")
const resultDataString = Papa.unparse(resuldData);
fs.writeFileSync(`${resultPath}/Audios_${batch}_${vendor}.csv`, resultDataString);
console.log("Created");

logStream.write(`Execution Done\n `);
logStream.end();