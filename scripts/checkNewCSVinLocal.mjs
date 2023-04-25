#!/usr/bin/env zx

const folderPath = "/home/Anshul/files/csv";
let lastProcessedFile = "";
let lastProcessedFileModifiedTime = new Date(0);

while (true) {
  console.log("Detectting new csv file")
  const files = await $`find ${folderPath} -type f`;
  console.log(files)

  let newestFile;
  let newestModifiedTime = new Date(0);
  for (const file of files.stdout.trim().split('\n')) {
    const { mtime } = await fs.stat(file);
    if (mtime > newestModifiedTime && mtime > lastProcessedFileModifiedTime) {
        console.log("New File detected")
      newestFile = file;
      newestModifiedTime = mtime;
    }
  }

  if (newestModifiedTime > lastProcessedFileModifiedTime) {
    const newestFilePath = newestFile;
    console.log(`New file detected: ${newestFile} (${newestFilePath})`);
    const separatorIndex = newestFilePath.lastIndexOf('/');
    const csvName = newestFilePath.substring(separatorIndex + 1);
    const csvNameParts = csvName.split("_");
    const batchDate = csvNameParts[0]
    const vendor = csvNameParts[3].slice(0,-4)

    // Run your other scripts here
    await $`zx ./createConfigFlies.mjs ${newestFilePath}`;
    console.log(`/home/Anshul/files/configFiles/${batchDate}_${vendor}_config.json`)
    await $`zx ./index.mjs /home/Anshul/files/configFiles/${batchDate}_${vendor}_config.json`;

    console.log("Running the required scripts")

    lastProcessedFile = newestFilePath;
    lastProcessedFileModifiedTime = newestModifiedTime;
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
}
