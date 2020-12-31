const path = require('path');
var childSync = require('child_process').execFileSync;

const extension = '.exe'

async function extractCsvContents(filePath) {
  const name = 'CsvExtractor'
  var args = [filePath];
  var executablePath = path.join(__dirname, `/executables/${name}${extension}`)
  return childSync(executablePath, args).toString();
}

console.log("Output: ", extractCsvContents('utils/sampleSession.csv'));

