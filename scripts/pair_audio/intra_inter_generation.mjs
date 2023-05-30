import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { existsSync } from "fs"

const inputPath = process.argv[3];
const outputPath = process.argv[4];

console.log(inputPath);
console.log(outputPath);

if (!existsSync(inputPath)) {
  console.error('Error: Input path not found');
  process.exit(1);
}

if (!existsSync(outputPath)) {
    console.error('Error: Output path not found');
    process.exit(1);
}

const intraWorkbook = xlsx.utils.book_new();
const interWorkbook = xlsx.utils.book_new();

function generateLink(fileName) {
    return `https://vaani.qc.artpark.in/pair_audio/${fileName}`;
}

function genrateInterFiles(inputFile, outputFolderPath) {
    const workbook = xlsx.readFile(inputFile);
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];
    const jsonSheet = xlsx.utils.sheet_to_json(firstSheet);

    jsonSheet.forEach((row) => {
        console.log(row)
        row["Result"] = null ? "" : row["Result"];
        row["Confidence"] = null ? "" : row["Confidence"];
        row["Detailed sheet link"] = null ? "" : row["Detailed sheet link"];
        row["File1_Link"] = generateLink(row["File1"]);
        row["File2_Link"] = generateLink(row["File2"]);
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

        jsonSheet.forEach((row, index) => {
            const newRow = {};
            const firstRow = {};
            firstRow["FileName"] = "  "
            firstRow["File_Link"] = "  "

            for (const key in row) {
                if (index === 0 && key !== "FileName" && key !== "Minimum_Score" && key !== "Minimum_Score_Reference" && key !== "Result" && key !== "Confidence") {
                        firstRow[key] = generateLink(key);
                }
                if (key === "FileName") {
                    newRow[key] = row[key]
                    newRow["File_Link"] = generateLink(row[key])
                }
                else if (key === "Minimum_Score_Reference") {
                    newRow[key] = row[key]
                    newRow["Minimum_Score_Reference_Link"] = generateLink(row[key])
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

generatePairAuido(inputPath, outputPath);