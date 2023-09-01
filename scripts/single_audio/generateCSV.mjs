const csvFilename = process.argv[3];
const batch = process.argv[4];
const vendor = process.argv[5];

const lastIndex = csvFilename.lastIndexOf('/');
const filename = csvFilename.slice(lastIndex + 1, -3) + "_config.json";

await $`zx /data2/Noobs/n00bs/scripts/single_audio/createConfigFlies.mjs ${csvFilename} ${batch} ${vendor}`;

await $`zx /data2/Noobs/n00bs/scripts/single_audio/index.mjs /data2/data_nginx/single_audio/${vendor}/configFiles/${filename}`;