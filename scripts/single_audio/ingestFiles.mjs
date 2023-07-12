const fs = require('fs');
const axios = require('axios');
const Papa = require("papaparse");

const csvFilePath = process.argv[3];
const vendor = process.argv[4];
const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const { data: csvData } = Papa.parse(csvContents)
if (csvData === null) {
    console.log(`Could'nt read the CSV file successfully\n `);
}
console.log(`Read CSV file successfully\n `);

async function createLinksAndPostRequest() {
    let filesData = [];
    let i = 0;
    for (const row of csvData) {
        if (i !== 0 && i !== 1) {
            const fileData = {
                file_name: row[2],
                file_type: 'audio',
                file: row[3],
                district: row[1],
                state: row[0],
                file_duration: row[4],
                vendor: vendor
            };
            filesData.push(fileData);
        }

        if(i === 1000) {
            console.log("Making request", filesData)
            const requestBody = {
              secret: '636eebcef989e94113c5d91c6b493cbd3a17c8df5737fcb7bce7fe90f03787c3',
              data: filesData
            };

            const response = await axios.post('https://qc.artpark.in/api/v1/2ddba7f3-798c-40bb-b687-d25a7180982a/public/file', requestBody)
              .then((response) => {
                console.log('POST request successful:', response.data);
              })
              .catch((error) => {
                console.error('Error making POST request:', error);
              });
            console.log(response);
            console.log("Successfull");
            filesData = []
        }
        i++;
    }
}

await createLinksAndPostRequest();
