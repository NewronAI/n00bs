#!/usr/bin/env zx

const fs = require('fs');
const csv = require('csv-parser');

const file = 'data.csv';

// Read the file contents
const data = fs.readFileSync(file, 'utf-8');

// Parse the CSV data into a JavaScript object
const results = [];
csv({ separator: ',' })
  .on('data', data => results.push(data))
  .on('end', () => {
    console.log(results);
  })
  .write(data);

console.log(results)