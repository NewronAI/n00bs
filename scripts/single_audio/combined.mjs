import fs from 'fs';
import path from 'path';
import papa from 'papaparse';

const csvFilePath = process.argv[3];

async function locateFilesRecursively(baseDirectory, filenames) {
  const foundFiles = [];

  async function searchDirectory(directory) {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await searchDirectory(fullPath);
      } else if (entry.isFile() && filenames.includes(entry.name)) {
        foundFiles.push(fullPath);
      }
    }
  }

  await searchDirectory(baseDirectory);

  return foundFiles;
}

async function readCSVAndLocateFiles(csvFilePath, baseDirectory) {
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const { data: rows } = papa.parse(csvData, { header: true });

  const filenames = rows.map(row => row['filename']); // Adjust the column header

  const foundFiles = await locateFilesRecursively(baseDirectory, filenames);

  for (const filePath of foundFiles) {
    console.log(`Found: ${path.basename(filePath)} at ${filePath}`);
    // Do something with the located file
  }
}

const baseDirectory = '/data/Database/manual_qc/SingleAudio_QC';

await readCSVAndLocateFiles(csvFilePath, baseDirectory);
