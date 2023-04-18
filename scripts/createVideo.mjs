const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const readdir = promisify(fs.readdir);
const exec = promisify(child_process.exec);

// Define the paths to the CSV file, the directory containing the images, and the output directory for the videos.
const csvFilePath = "/path/to/your/csv/file.csv";
const imagesDirPath = "/path/to/your/images/directory";
const videosDirPath = "/path/to/your/videos/directory";

function extractFileInfo(filename) {
  const parts = filename.split("_");
  const state = parts[2];
  const district = parts[3];
  const speakerID = parts[4];
  const utteranceID = parts[5].split("-")[0];
  return { state, district, speakerID, utteranceID };
}

async function findImageFile(imageName) {
  const files = await readdir(imagesDirPath);
  const matchingFile = files.find((file) => file.includes(imageName));
  if (matchingFile) {
    return path.join(imagesDirPath, matchingFile);
  } else {
    return null;
  }
}

async function createVideoFile(audioFilePath, imageFilePath, outputFilePath) {
  await exec(`ffmpeg -loop 1 -i ${imageFilePath} -i ${audioFilePath} -c:v libx264 -tune stillimage -c:a copy -shortest ${outputFilePath}`);
}

const csvFileContents = fs.readFileSync(csvFilePath, "utf8");
const { data: csvData } = Papa.parse(csvFileContents, { header: true });

for (const row of csvData) {
  const audioFilename = row["Audio Filename"];
  const { state, district, speakerID, utteranceID } = extractFileInfo(audioFilename);

  const imageName = row["Image name (alphabets_number)"];
  const imageFilePath = await findImageFile(imageName);

  if (imageFilePath) {
    const outputFilename = `${state}_${district}_${speakerID}_${utteranceID}.mp4`;
    const outputFilePath = path.join(videosDirPath, outputFilename);
    await createVideoFile(audioFilePath, imageFilePath, outputFilePath);
    console.log(`Created video file: ${outputFilePath}`);
  } else {
    console.log(`Could not find image file for audio file: ${audioFilename}`);
  }
}
