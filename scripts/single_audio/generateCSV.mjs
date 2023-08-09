const csvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

await $`zx ./createConfigFlies.mjs ${csvFilename} ${batch} ${vendor}`;

await $`zx ./index.mjs /data2/data_nginx/single_audio/${vendor}/configFiles/${batch}_${vendor}_missing_config.json.json`;