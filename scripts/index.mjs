const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

// const readdir = promisify(fs.readdir);
// const exec = promisify(child_process.exec);

// Read the config file and extract the directory paths.
const configFilePath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configFilePath));

// console.log(config.baseLocation, config.imagesDirPath, config.videosDirPath, config.csvFilePath)

const baseLocation = config.baseLocation;
const imagesDirPath = config.imagesDirPath;
const videosDirPath = config.videosDirPath;
const csvFilePath = config.csvFilePath;

// function extractFileInfo(filename) {
//   const parts = filename.split("_");
// //   const state = parts[2];
// //   const district = parts[3];
// //   const speakerID = parts[4];
// //   const utteranceID = parts[5].split("-")[0];
//   console.log(parts)
//   console.log(state, district, speakerID, utteranceID)
//   return null;
// }

// async function findImageFile(imageName) {
// //   const files = await readdir(imagesDirPath);
// //   const matchingFile = files.find((file) => file.includes(imageName));
// //   if (matchingFile) {
// //     return path.join(imagesDirPath, matchingFile);
// //   } else {
// //     return null;
// //   }
// }

// async function createVideoFile(audioFilePath, imageFilePath, outputFilePath) {
//   await exec(`ffmpeg -loop 1 -i ${imageFilePath} -i ${audioFilePath} -c:v libx264 -tune stillimage -c:a copy -shortest ${outputFilePath}`);
// }

const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)

for (const row of csvData) {
    const fileName = row[1]
  console.log("Row Data", fileName)

//   if (imageFilePath) {
//     // If an image file was found, create the video file.
//     const outputFilename = `${state}_${district}_${speakerID}_${utteranceID}.mp4`;
//     const outputFilePath = path.join(videosDirPath, outputFilename);
//     await createVideoFile(audioFilePath, imageFilePath, outputFilePath);
//     console.log(`Created video file: ${outputFilePath}`);
//   } else {
//     console.log(`Could not find image file for audio file: ${audioFilename}`);
//   }
}
