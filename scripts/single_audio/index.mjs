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
const imagesDirPath = config.imagesDirPath;
const csvFilePath = config.csvFilePath;
const audioLocation = config.audioLocation;
const imageNotFoundDataCsvPath = config.imageNotFoundDataCsvPath;
const resultPath = config.resultCSV;
const vendor = config.vendor;
const batch = config.batch;
const audioBaseLocation = config.baseAudioLocation;

const now = new Date();
const logFileName = `${logsPath}/log-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.txt`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });
logStream.write('Started running the script\n');

// const readdir = promisify(fs.readdir);
const exec = promisify(child_process.exec);

logStream.write('Getting Directories location from config file\n');
logStream.write(`Base Location is ${baseLocation}\n`);
logStream.write(`Images Dir Path is ${imagesDirPath}\n`);
logStream.write(`CSV File Path is ${csvFilePath}\n`);
logStream.write(`Base Dir Audio Path is ${audioBaseLocation}\n`);
logStream.write(`Audio Path is ${audioLocation}\n`);

console.log('Getting Directories location from config file\n');
console.log(`Base Location is ${baseLocation}\n`);
console.log(`Images Dir Path is ${imagesDirPath}\n`);
console.log(`CSV File Path is ${csvFilePath}\n`);

const imageNotFoundData = [
  { fileName: "File Name", imageName: "Image Name" }
];

const resuldData = [
  { state: "State", district: "District", fileName: "File Name", fileLink: "File Link", duration: "Duration of audio(s)" }
];

function extractFileInfo(filename) {
  const parts = filename.split("_");
  const state = parts[0];
  const district = parts[1];
  const speakerID = parts[2];
  const utteranceID = parts[3].split("-")[0];
  const imageName = parts[4] !== "IMG" ? (parts[4].slice(0, 3) === "IMG" ? parts[4] : parts[4] + '_' + parts[5]) : parts[4] + '_' + parts[5] + '_' + parts[6];
  const secondLastNumber = parseInt(parts[parts.length - 2]);
  const lastNumber = parseInt(parts[parts.length - 1].slice(0, -4));
  console.log(parts[parts.length - 2], "-----", parts[parts.length - 1])
  const duration = (lastNumber - secondLastNumber) / 1000;
  console.log({state, district, speakerID, utteranceID, imageName, duration})
  return { state, district, speakerID, utteranceID, imageName, duration };
}

function extractImageName(filename) {
  const parts = filename.split("_");
  return parts[4];
}

async function checkFile(filename, filepath) {
  logStream.write(`Checking if the audio file (${filename}) is present in ${filepath}\n`);

  const directory = baseLocation + '/' + filepath

  if (existsSync(`${directory}/${filename}`)) {
    logStream.write(`Audio file is present\n `);
    return true;
  } else {
    logStream.write(`Audio file is not present \n`);
    return false;
  }
}

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

function getImageName(filename) {
  const parts = filename.split("_");
  let imageName = "";
  for(let i=0; i<parts.length; i++) {
    if(i >= 4 && i<(parts.length - 2)) {
      imageName = imageName + "_" + parts[i];
    }
  }
  console.log("Image Name :", imageName.slice(1));
  return imageName.slice(1);
}

async function copyAndCheckImage(imageName) {
  const parts = imageName.split("_");
  const sliced = imageName.slice(0, -1);
  if (existsSync(`${imagesDirPath}/${imageName}.jpg`)) {
    console.log("Image found in local directory. Image format is JPG")
    return imageName + ".jpg";
  } else if(existsSync(`${imagesDirPath}/${imageName}.jpeg`)) {
    console.log("Image found in local directory. Image format is JPEG")
    return imageName + ".jpeg";
  } else if(existsSync(`${imagesDirPath}/${sliced}.jpg`)) {
    console.log("Image found in local directory. Image format is JPG")
    return sliced + ".jpg";
  } else if(existsSync(`${imagesDirPath}/${sliced}.jpeg`)) {
    console.log("Image found in local directory. Image format is JPEG")
    return sliced + ".jpeg";
  } else if(existsSync(`${imagesDirPath}/${parts[0]}.jpeg`)) {
    console.log("Image found in local directory. Image format is JPEG")
    return parts[0] + ".jpeg";
  } else if(existsSync(`${imagesDirPath}/${parts[0]}.jpg`)) {
    console.log("Image found in local directory. Image format is JPG")
    return parts[0] + ".jpg";
  } else {
    console.log(imageName, "Image not in Local Directory.")
    return false;
  }
}

function getFileLink(fileLocation, imageLocation) {
  console.log("fileDetails", fileLocation, "imageLocation", imageLocation)
  const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
  const relevantImageLocation = imageLocation.split("/").slice(4).join("/");
  console.log("File Locaton Given", relevantFileLocation);
  console.log("Image Locaton Given", relevantImageLocation)
  const encodedFileLocation = encodeURIComponent(relevantFileLocation)
  //const encodedImageLocation = encodeURIComponent(imageLocationParts[4] + "/" + imageLocationParts[5] + "/" + imageLocationParts[6] + ".jpg")
  const encodedImageLocation = encodeURIComponent(relevantImageLocation)
  const fileLink = `http://vaani.qc.artpark.in/single_audio/?a=${encodedFileLocation}&i=${encodedImageLocation}`
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

    const { state, district, speakerID, utteranceID, imageName, duration } = extractFileInfo(fileName)
    let image_name = getImageName(fileName);
    logStream.write(`Extracted the files details successfully\n `);

    const checkAudioFile = await checkAndCopyAudioFile(fileName)
    let checkImageFile = await copyAndCheckImage(image_name)

    if (!checkImageFile) {
      imageNotFoundData.push({ fileName: fileName, imageName: image_name });
    }

    console.log("checkAudioFile", checkAudioFile, " checkImageFile", checkImageFile);

    if (checkAudioFile && checkImageFile) {
      const fileLink = getFileLink(`${audioLocation}/${fileName}`, imagesDirPath + "/" + checkImageFile)
      console.log(fileLink)
      resuldData.push({ state: state, district: district, fileName: fileName, fileLink: fileLink, duration: duration })
    }
  }
}

const imageNotFoundString = Papa.unparse(imageNotFoundData);
fs.writeFileSync(`${imageNotFoundDataCsvPath}/ImageNotFound-${vendor}-${batch}.csv`, imageNotFoundString);

console.log("Creating resultant csv")
const resultDataString = Papa.unparse(resuldData);
fs.writeFileSync(`${resultPath}/${batch}_${vendor}.csv`, resultDataString);
console.log("Created")

logStream.write(`Execution Done\n `);
logStream.end();
