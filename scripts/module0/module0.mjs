import { existsSync } from "fs"

const audioFileName = process.argv[3];
const imageName = process.argv[4];

if (!existsSync(`${imageName}`)) {
    if (imageName !== "NULL") {
        console.log(`Could not find the image file.`, imageName);
        exit(1);
    }
}

if (!existsSync(`${audioFileName}`)) {
    if (audioFileName !== "NULL") {
        console.log(`Could not find the audio file.`, audioFileName);
        exit(1);
    }
}

function getFileLink(fileLocation, imageLocation) {
    const encodedFileLocation = encodeURIComponent(fileLocation.split("/").slice(4).join("/"));
    const encodedImageLocation = encodeURIComponent(imageLocation.split("/").slice(4).join("/"));
    if(fileLocation === "NULL") {
        return `http://vaani.qc.artpark.in/iisc/?i=${encodedImageLocation}`;
    }
    if(imageLocation === "NULL") {
        return `http://vaani.qc.artpark.in/iisc/?a=${encodedFileLocation}`;
    }
    return `http://vaani.qc.artpark.in/iisc/?a=${encodedFileLocation}&i=${encodedImageLocation}`;
}

const link = getFileLink(audioFileName, imageName);

console.log("Link", link);