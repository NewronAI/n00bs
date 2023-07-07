const fs = require('fs');
const path = require('path');
const axios = require('axios');

const directoryPath = '/data2/data_nginx/single_audio/dummy'; // Replace with the actual directory path

function getFileLink(relativePath) {
    const fileLocation = "dummy/" + relativePath;
    const encodedFileLocation = encodeURIComponent(fileLocation)
    const fileLink = `http://vaani.qc.artpark.in/single_audio/?a=${encodedFileLocation}`;
    return fileLink
  }

function createLinksAndPostRequest(directoryPath) {
  const filesData = [];

  // Read the state folders in the directory
  const stateFolders = fs.readdirSync(directoryPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Process each state folder
  stateFolders.forEach((state) => {
    const statePath = path.join(directoryPath, state);

    // Read the district folders in the state folder
    const districtFolders = fs.readdirSync(statePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Process each district folder
    districtFolders.forEach((district) => {
      const districtPath = path.join(statePath, district);

      // Read the audio files in the district folder
      const audioFiles = fs.readdirSync(districtPath)
        .filter((file) => path.extname(file) === '.wav');

      // Process each audio file
      audioFiles.forEach((file) => {
        const filePath = path.join(districtPath, file);
        const fileLink = getFileLink(path.relative(directoryPath, filePath));

        // Prepare the data object for the POST request
        const fileData = {
          file_name: file,
          file_type: 'audio',
          file: fileLink,
          district: district,
          state: state
        };

        filesData.push(fileData);
      });
    });
  });

  const requestBody = {
    secret: '636eebcef989e94113c5d91c6b493cbd3a17c8df5737fcb7bce7fe90f03787c3',
    data: filesData
  };

  axios.post('https://qc.artpark.in/api/v1/2ddba7f3-798c-40bb-b687-d25a7180982a/public/file', requestBody)
    .then((response) => {
      console.log('POST request successful:', response.data);
    })
    .catch((error) => {
      console.error('Error making POST request:', error);
    });
  console.log("Making request", filesData)
}

createLinksAndPostRequest(directoryPath);
