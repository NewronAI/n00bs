const fs = require('fs');
const axios = require('axios');
const Papa = require("papaparse");

const csvFilePath = process.argv[3];
const vendor = process.argv[4];
const csvContents = await fs.promises.readFile(csvFilePath, 'utf-8')

const tsvArray = Papa.parse(csvContents, {
    delimiter: "\t",
    header: false,
}).data;

if (tsvArray === null) {
    console.log(`Could'nt read the CSV file successfully\n `);
}
console.log(`Read CSV file successfully\n `);

async function createLinksAndPostRequest() {
    let filesData = [];
    let i = 0;
    for (const row of tsvArray) {
        if (i !== 0) {
            const fileInfo = row[0].split(',');
            const fileData = {
                file_name: fileInfo[2],
                file_type: 'audio',
                file: fileInfo[3],
                district: fileInfo[1],
                state: fileInfo[0],
                file_duration: parseFloat(fileInfo[4]),
                vendor: vendor,
                metadata: {
                    "transcriptionText" : fileInfo[5]
                }
            };
            console.log(fileData);
            filesData.push(fileData);
        }

        if (i === 1000) {
            console.log("Total files ingesting", filesData.length);
            const requestBody = {
                secret: '0e32e9313c1f71f0da8969c9bc828a9d62e1f7251a39197e48b4ebef1eda2da2',
                data: filesData
            };

            const response = await axios.post('https://qc.artpark.in/api/v1/ca7e71ba-4f4e-4da5-a00e-3289c18aaad0/public/file', requestBody)
                .then((response) => {
                    console.log('POST request successful:', response.data);
                })
                .catch((error) => {
                    console.error('Error making POST request:', error);
                });
            console.log(response);
            console.log("Successfull");
            filesData = []
            i = 2;
        }

        i++;
    }

    const requestBody = {
        secret: '636eebcef989e94113c5d91c6b493cbd3a17c8df5737fcb7bce7fe90f03787c3',
        data: filesData
    };
    console.log("Total files ingesting", filesData.length);
    const response = await axios.post('https://qc.artpark.in/api/v1/ca7e71ba-4f4e-4da5-a00e-3289c18aaad0/public/file', requestBody)
        .then((response) => {
            console.log('POST request successful:', response.data);
        })
        .catch((error) => {
            console.error('Error making POST request:', error);
        });
    console.log(response);
}

await createLinksAndPostRequest();
