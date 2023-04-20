const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");
const configFilePath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configFilePath));
import { existsSync } from "fs"
import { clearScreenDown } from "readline";

const logsPath = config.logsPath;
const baseLocation = config.baseLocation;
const imagesDirPath = config.imagesDirPath;
const videosDirPath = config.videosDirPath;
const csvFilePath = config.csvFilePath;
const imageNotFoundDataCsvPath = config.imageNotFoundDataCsvPath;

const now = new Date();
const logFileName = `${logsPath}/log-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.txt`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });
logStream.write('Started running the script\n');

// const readdir = promisify(fs.readdir);
const exec = promisify(child_process.exec);

logStream.write('Getting Directories location from config file\n');
logStream.write(`Base Location is ${baseLocation}\n`);
logStream.write(`Images Dir Path is ${imagesDirPath}\n`);
logStream.write(`Single Audio Videos Dir Path is ${videosDirPath}\n`);
logStream.write(`CSV File Path is ${csvFilePath}\n`);

const imageNotFoundData = [
  {fileName: "File Name", imageName: "Image Name"}
];

function extractFileInfo(filename) {
  const parts = filename.split("_");
  const state = parts[0];
  const district = parts[1];
  const speakerID = parts[2];
  const utteranceID = parts[3].split("-")[0];
  const imageName = parts[4] !== "IMG" ? (parts[4].slice(0, 3) === "IMG" ? parts[4] : parts[4] + '_' + parts[5] ): parts[4] + '_' + parts[5] + '_' + parts[6];
  return { state, district, speakerID, utteranceID, imageName };
}

async function checkFile(filename, filepath) {
  logStream.write(`Checking if the audio file (${filename}) is present in ${filepath} \n `);

  const directory = baseLocation + '/' + filepath

  if (existsSync(`${directory}/${filename}`)) {
    logStream.write(`Audio file is present\n `);
    return true
  } else {
    logStream.write(`Audio file is not present \n`);
    return false
  }
}

async function copyAndCheckImage(imageName) {
  if(existsSync(`${imagesDirPath}/${imageName}.jpg`)) {
    console.log("Image found in local directory")
    return true
  } else {
    try {
      await exec(`scp -r -i $HOME/.ssh/id_rsa_ldai artpark@34.93.48.56:/data2/Database/2023-03-22/Images/Images_Mar23/${imageName}.jpg /home/Anshul/files/images/Images_Mar23
      `);
      console.log(imageName, "Image found in artpark instance and downloaded")
      return true
    } catch (e) {
      console.log(imageName, "Image not in local and artpark instance found")
      return false
    }
  }
}

async function createVideoFile(audioName , audioFilePath , imageFilePath , outputFilePath) {
  const videoFilePath = outputFilePath + '/' + audioName.slice(0,-4) + '.mp4'
  try {
    await exec(`ffmpeg -loop 1 -i ${imageFilePath} -i ${audioFilePath} -c:v libx264 -tune stillimage -c:a copy -shortest ${videoFilePath}`);
    logStream.write(`Can not create this file video ${audioFilePath}\n`);
    console.log("Created the video for this audio", audioFilePath)
    return true;
  } catch (e) {
    console.log(e)
    logStream.write(`Can not create this file video ${audioFilePath}. showing this error ${e}\n`);
    return false;
  }
}

logStream.write(`Reading CSV file located in ${csvFilePath} \n `);
const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if(csvData === null) {
  logStream.write(`Read CSV file successfully\n `);
}
logStream.write(`Read CSV file successfully\n `);

for (const row of csvData) {

  const fileDetails = row[1]

  if (fileDetails !== undefined) {
    logStream.write(`Working on this file ${fileDetails} \n `);
    const separatorIndex = fileDetails.lastIndexOf('/');
    const fileLocation = fileDetails.substring(0, separatorIndex);
    const fileName = fileDetails.substring(separatorIndex + 1);

    const { state, district, speakerID, utteranceID, imageName } = extractFileInfo(fileName)
    logStream.write(`Extracted the files details successfully\n `);

    const checkAudioFile = await checkFile(fileName, fileLocation)
    const checkImageFile = await copyAndCheckImage(imageName)

    console.log("checkAudioFile",checkAudioFile," checkImageFile",checkImageFile)
    if(!checkImageFile) {
      imageNotFoundData.push({fileName: fileName, imageName: imageName})
    }

    if(checkAudioFile && checkImageFile) {
      const checkVideoFile = await createVideoFile(fileName, `${baseLocation}/${fileDetails}`,`${imagesDirPath}/${imageName}.jpg`,`${videosDirPath}`)
      if(checkVideoFile) {
        console.log("Created")
      }
      else {
        console.log("Not Created")
      }
    }
  }
}

const imageNotFoundString = Papa.unparse(imageNotFoundData);
fs.writeFileSync(`${imageNotFoundDataCsvPath}/csv-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}.csv`, imageNotFoundString);

logStream.write(`Execution Done\n `);
logStream.end();
