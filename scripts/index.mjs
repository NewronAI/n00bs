const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const readdir = promisify(fs.readdir);
const exec = promisify(child_process.exec);

// Read the config file and extract the directory paths.
const configFilePath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configFilePath));

const baseLocation = config.baseLocation;
const imagesDirPath = config.imagesDirPath;
const videosDirPath = config.videosDirPath;
const csvFilePath = config.csvFilePath;

// Define a function that takes a filename and extracts the state, district, speaker ID, and utterance ID from it.
function extractFileInfo(filename) {
  const parts = filename.split("_");
  const state = parts[2];
  const district = parts[3];
  const speakerID = parts[4];
  const utteranceID = parts[5].split("-")[0];
  return { state, district, speakerID, utteranceID };
}

// Define a function that searches for an image file with the given name in the images directory.
async function findImageFile(imageName) {
  const files = await readdir(imagesDirPath);
  const matchingFile = files.find((file) => file.includes(imageName));
  if (matchingFile) {
    return path.join(imagesDirPath, matchingFile);
  } else {
    return null;
  }
}

// Define a function that takes an audio file path and an image file path, and creates a video file by combining them.
async function createVideoFile(audioFilePath, imageFilePath, outputFilePath) {
  await exec(`ffmpeg -loop 1 -i ${imageFilePath} -i ${audioFilePath} -c:v libx264 -tune stillimage -c:a copy -shortest ${outputFilePath}`);
}

// Read the CSV file using Papa Parse.
const csvFileContents = fs.readFileSync(csvFilePath, "utf8");
const { data: csvData } = Papa.parse(csvFileContents, { header: true, skipEmptyLines: 'greedy' });

// Loop through each row in the CSV data.
for (const row of csvData) {
  // Extract the necessary information from the audio file name.
  const audioFilename = row["Audio Filename"];
  const audioFilePath = path.join(baseLocation, audioFilename);
  const { state, district, speakerID, utteranceID } = extractFileInfo(audioFilename);

  console.log(`Processing audio file: ${audioFilePath}`);

  // Search for the corresponding image file.
  const imageName = row["Image name (alphabets_number)"];
  const imageFilePath = await findImageFile(imageName);

  if (imageFilePath) {
    // If an image file was found, create the video file.
    const outputFilename = `${state}_${district}_${speakerID}_${utteranceID}.mp4`;
    const outputFilePath = path.join(videosDirPath, outputFilename);
    await createVideoFile(audioFilePath, imageFilePath, outputFilePath);
    console.log(`Created video file: ${outputFilePath}`);
  } else {
    console.log(`Could not find image file for audio file: ${audioFilename}`);
  }
}
