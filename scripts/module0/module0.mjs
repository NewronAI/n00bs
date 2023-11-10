const imageName = process.argv[3];
const audioFileName = process.argv[4];

if(!existsSync(`${imageName}`)) {
    console.log(`Could not find the image file.`);
    exit(0);
}

if(!existsSync(`${audioFileName}`)) {
    console.log(`Could not find the audio file.`);
    exit(0);
}

function getFileLink(fileLocation, imageLocation) {
    console.log("fileDetails", fileLocation, "imageLocation", imageLocation)
    const relevantFileLocation = fileLocation.split("/").slice(4).join("/");
    const relevantImageLocation = imageLocation.split("/").slice(4).join("/");
    console.log("File Locaton Given", relevantFileLocation);
    console.log("Image Locaton Given", relevantImageLocation);
    const encodedFileLocation = encodeURIComponent(relevantFileLocation);
    //const encodedImageLocation = encodeURIComponent(imageLocationParts[4] + "/" + imageLocationParts[5] + "/" + imageLocationParts[6] + ".jpg")
    const encodedImageLocation = encodeURIComponent(relevantImageLocation);
    const fileLink = `http://vaani.qc.artpark.in/iisc/?a=${encodedFileLocation}&i=${encodedImageLocation}`
    return fileLink;
  }

const link = getFileLink(audioFileName, imageName);

console.log("Link", link);