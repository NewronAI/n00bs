import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { existsSync } from "fs"
const { promisify } = require("util");
const child_process = require("child_process");
const exec = promisify(child_process.exec);


const inputPath = process.argv[3];
const vendor = process.argv[4];
const batch = process.argv[5];
const state_district = process.argv[6];
const outputPath = `/data2/data_nginx/pair_audio/result/${vendor}/${batch}/${state_district}`

console.log("inputPath:",inputPath)
console.log("vendor:",vendor)
console.log("batch:",batch)
console.log("state_district:",state_district)
console.log("Output path",outputPath);

if(!existsSync(`/data2/data_nginx/pair_audio/result/${vendor}/${batch}`)) {
    console.error('Batch folder not found');
    try {
      await exec(`mkdir /data2/data_nginx/pair_audio/result/${vendor}/${batch}`)
      await exec(`mkdir /data2/data_nginx/pair_audio/result/${vendor}/${batch}/${state_district}`)
      console.log("Folder Created:" + `/data2/data_nginx/pair_audio/result/${vendor}/${batch}/${state_district}`)
    } catch (e) {
      console.error("Error", e);
      process.exit(1);
    }
}

if (!existsSync(outputPath)) {
  console.error('Error: Input path not found');
  try {
    await exec(`mkdir ${outputPath}`)
  } catch (e) {
    console.error("Error", e);
    process.exit(1);
  }
}

if (!existsSync(inputPath)) {
    console.error('Error: Input path not found');
    process.exit(1);
}

if (!existsSync(`/data2/data_nginx/pair_audio/audio/${vendor}/${batch}`)) {
    console.error('Error: Audios not found');
    process.exit(1);
}

const stateAbbrev = {
    "AP": "AP",
    "AR": "ArunachalPradesh",
    "AS": "Assam",
    "BR": "Bihar",
    "CG": "Chhattisgarh",
    "GA": "Goa",
    "GJ": "Gujarat",
    "HR": "Haryana",
    "HP": "HimachalPradesh",
    "JH": "Jharkhand",
    "KA": "Karnataka",
    "KL": "Kerala",
    "MP": "MadhyaPradesh",
    "MH": "Maharashtra",
    "MN": "Manipur",
    "ML": "Meghalaya",
    "MZ": "Mizoram",
    "NL": "Nagaland",
    "OR": "Orissa",
    "PB": "Punjab",
    "RJ": "Rajasthan",
    "SK": "Sikkim",
    "TN": "TamilNadu",
    "TR": "Tripura",
    "UK": "Uttarakhand",
    "UP": "UttarPradesh",
    "WB": "WestBengal",
    "TN": "TamilNadu",
    "TR": "Tripura",
    "CH": "Chandigarh",
    "DL": "DL",
}

const intraWorkbook = xlsx.utils.book_new();
const interWorkbook = xlsx.utils.book_new();

function findFileInDirectory(fileName, directory) {
    const files = fs.readdirSync(directory); // Read the contents of the given directory

    for (const file of files) {
      const filePath = path.join(directory, file); // Get the absolute path of the file

      if (fs.statSync(filePath).isDirectory()) {
        const foundFile = findFileInDirectory(fileName, filePath); // Recursively search within subdirectories

        if (foundFile) {
          return foundFile; // Return the file location if found
        }
      } else if (file === fileName) {
        return filePath; // Return the file location if the file name matches
      }
    }

    return null; // Return null if the file is not found
  }

function findFolderByPrefix(directory,prefix) {
    const files = fs.readdirSync(directory); // Read the current directory

    for (const file of files) {
      if (file.startsWith(prefix)) {
        return file; // Return the matching folder name
      }
    }

    return null; // Return null if no matching folder is found
  }

async function findAudioFile(filename, vendor) {
    const state_districtParts = state_district.split("_");
    if(vendor === "megdap") {
        const audioDirectory = `/data2/data_nginx/pair_audio/audio/megdap/${batch}/`;
        if (existsSync( audioDirectory + `${stateAbbrev[state_districtParts[0]]}`)) {
            const district = findFolderByPrefix(audioDirectory + `${stateAbbrev[state_districtParts[0]]}`, state_districtParts[1])
            console.log(stateAbbrev[state_districtParts[0]],"----", district)
            if(district === null) {
                console.log("Could'nt find the district name",state_districtParts[0], "in path:", audioDirectory + `${stateAbbrev[state_districtParts[0]]}`);
                return null
            }
            const filepath = findFileInDirectory(filename + ".wav", audioDirectory+ `${stateAbbrev[state_districtParts[0]]}` + "/" + district);
            if(filepath === null) {
                console.log("Could'nt find the file:", filename + ".wav" + "in location:", audioDirectory+ `${stateAbbrev[state_districtParts[0]]}` + "/" + district)
                return null
            }
            else {
                return filepath;
            }
        }
    }
}

async function generateLink(fileName) {
    const audioFilePath = await findAudioFile(fileName,vendor);
    console.log(audioFilePath)
    if(audioFilePath === null) {
        return null
    }
    return `https://vaani.qc.artpark.in/pair_audio/${audioFilePath}`;
}

function genrateInterFiles(inputFile, outputFolderPath) {
    const workbook = xlsx.readFile(inputFile);
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];
    const jsonSheet = xlsx.utils.sheet_to_json(firstSheet);

    jsonSheet.forEach(async (row) => {
        console.log(row)
        row["Result"] = null ? "" : row["Result"];
        row["Confidence"] = null ? "" : row["Confidence"];
        row["Detailed sheet link"] = null ? "" : row["Detailed sheet link"];
        row["File1_Link"] = await generateLink(row["File1"]);
        row["File2_Link"] = await generateLink(row["File2"]);
    })

    const newSheet = xlsx.utils.json_to_sheet(jsonSheet);
    xlsx.utils.book_append_sheet(interWorkbook, newSheet, "inter");
    const outputFile = outputFolderPath + "/" + "inter.xlsx"
    fs.writeFileSync(outputFile, xlsx.write(interWorkbook, { type: 'buffer' }));
}

function generatePairAuido(inputFolderPath, outputFolderPath) {
  const files = fs.readdirSync(inputFolderPath);
  for (const file of files) {
    if(file.slice(-5) !== ".xlsx") {
        console.log(file, "file name is not in proper format");
    }
    else if (file === "inter.xlsx") {
        genrateInterFiles(inputFolderPath + "/" + file, outputFolderPath)
    }
    else {
        const fileNameParts = file.split("_");
        const inputFile = inputPath + "/" + file;
        const workbook = xlsx.readFile(inputFile);
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const jsonSheet = xlsx.utils.sheet_to_json(firstSheet);
        const newJsonsSheet = []

        jsonSheet.forEach(async (row, index) => {
            const newRow = {};
            const firstRow = {};
            firstRow["FileName"] = "  "
            firstRow["File_Link"] = "  "

            for (const key in row) {
                if (index === 0 && key !== "FileName" && key !== "Minimum_Score" && key !== "Minimum_Score_Reference" && key !== "Result" && key !== "Confidence") {
                        firstRow[key] = await generateLink(key);
                }
                if (key === "FileName") {
                    newRow[key] = row[key]
                    newRow["File_Link"] = generateLink(row[key])
                }
                else if (key === "Minimum_Score_Reference") {
                    newRow[key] = row[key]
                    newRow["Minimum_Score_Reference_Link"] = await generateLink(row[key])
                }
                else {
                    newRow[key] = row[key]
                }
            }

            if(index === 0) {
                firstRow["Minimum_Score"] = "  "
                firstRow["Minimum_Score_Reference"] = "  "
                firstRow["Minimum_Score_Reference_Link"] = "  "
                newJsonsSheet.push(firstRow);
            }
            newJsonsSheet.push(newRow);
        });

        const newSheet = xlsx.utils.json_to_sheet(newJsonsSheet);
        const sheetName = fileNameParts[2].slice(0, -5)
        xlsx.utils.book_append_sheet(intraWorkbook, newSheet, sheetName);
        console.log("Sheet Inserted")
    }
  }
  const outputFile = outputPath + "/" + "intra.xlsx"
  fs.writeFileSync(outputFile, xlsx.write(intraWorkbook, { type: 'buffer' }));
}

await generatePairAuido(inputPath, outputPath);