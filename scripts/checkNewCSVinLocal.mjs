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

    // Run your other scripts here
    const configFile = await $`zx ./createConfigFlies.mjs ${newestFilePath}`;
    //await $`zx ./index.mjs ${newestFilePath}`;

    console.log("Running the required scripts")
    console.log(configFile)
    
    lastProcessedFile = newestFilePath;
    lastProcessedFileModifiedTime = newestModifiedTime;
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
}
