const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

// const readdir = promisify(fs.readdir);
// const exec = promisify(child_process.exec);

const configFilePath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configFilePath));

const baseLocation = config.baseLocation;
const imagesDirPath = config.imagesDirPath;
const videosDirPath = config.videosDirPath;
const csvFilePath = config.csvFilePath;

function extractFileInfo(filename) {
  const parts = filename.split("_");
  const state = parts[0];
  const district = parts[1];
  const speakerID = parts[2];
  const utteranceID = parts[3].split("-")[0];
  const imageName = parts[4] + '_' + parts[5];
  return {state, district, speakerID, utteranceID, imageName};
}

async function findImageFile(imageName) {
//   const files = await readdir(imagesDirPath);
//   const matchingFile = files.find((file) => file.includes(imageName));
//   if (matchingFile) {
//     return path.join(imagesDirPath, matchingFile);
//   } else {
//     return null;
//   }
}

async function createVideoFile(audioFilePath, imageFilePath, outputFilePath) {
  await exec(`ffmpeg -loop 1 -i ${imageFilePath} -i ${audioFilePath} -c:v libx264 -tune stillimage -c:a copy -shortest ${outputFilePath}`);
}

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)

for (const row of csvData) {

    const fileDetails = row[1]

    const separatorIndex = fileDetails.lastIndexOf('/');
    const fileLocation = fileDetails.substring(0, separatorIndex);
    const fileName = fileDetails.substring(separatorIndex + 1);

    const {state, district, speakerID, utteranceID, imageName} = extractFileInfo(fileName)

    

}
