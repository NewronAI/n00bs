const csvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

await $`zx ./audioLinkConfig.mjs ${csvFilename} ${batch} ${vendor}`;

await $`zx ./audioLinks.mjs /data2/data_nginx/single_audio/${vendor}/configFiles/audioLinks/${batch}_${vendor}_config.json`;