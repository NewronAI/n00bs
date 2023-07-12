const fs = require('fs');
const path = require('path');
const axios = require('axios');
import { existsSync } from "fs"
import { clearScreenDown } from "readline";
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const Papa = require("papaparse");

const csvFilePath = process.argv[3];
const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
  logStream.write(`Could'nt read the CSV file successfully\n `);
}
logStream.write(`Read CSV file successfully\n `);

async function createLinksAndPostRequest(directoryPath) {
  const filesData = [];

  for (const row of csvData) {
    console.log(row);
    // const fileData = {
    //     file_name: file,
    //     file_type: 'audio',
    //     file: fileLink,
    //     district: district,
    //     state: state
    //   };

    //   filesData.push(fileData);
  }

//   const requestBody = {
//     secret: '636eebcef989e94113c5d91c6b493cbd3a17c8df5737fcb7bce7fe90f03787c3',
//     data: filesData
//   };

//   const response = await axios.post('https://qc.artpark.in/api/v1/2ddba7f3-798c-40bb-b687-d25a7180982a/public/file', requestBody)
//     .then((response) => {
//       console.log('POST request successful:', response.data);
//     })
//     .catch((error) => {
//       console.error('Error making POST request:', error);
//     });
//   console.log("Making request", filesData)
}

await createLinksAndPostRequest(directoryPath);