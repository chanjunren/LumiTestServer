const path = require("path");
const fs = require('fs');

const filename = 'z1/z2/z3';
const parent_dir = path.join('../..', filename)
console.log(parent_dir);

// fs.mkdir(filename, {recursive: true}, err => {
//     console.log(err);
// })