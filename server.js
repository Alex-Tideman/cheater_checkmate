const bodyParser = require('body-parser')
const fs = require('fs')
const request = require('request')
const levenshtein = require('fast-levenshtein')

const flaggedPerson = process.argv[2]
const flaggedRepo = process.argv[3]
const flaggedFile = process.argv[4]

const comparisonPerson = process.argv[5]
const comparisonRepo = process.argv[6]
const comparisonFile = process.argv[7]

let flaggedArray = []
let comparisonArray = []

if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + 'FLAGGED FILENAME' + 'COMPARISON FILENAME');
  process.exit(1)
}

const parseFile = (file) => {
  return file.split('\n')
}

const readResults = (sameLines) => {
  let readOut = {
    totalSameLines: sameLines.length,
    sameLines
  }
  console.log("Readout: ", readOut)
}

const compareContent = (flag, compare) => {
  let sameLines = []
  for(let i=0; i <= compare.length; i++) {
    for(let j=0; j <= flag.length; j++) {
      if(compare[i] && flag[j] && compare[i] !== '' && flag[j] !== ''
         && levenshtein.get(compare[i], flag[j]) <= 3) {
        sameLines.push({lineNumber: j + 1,
                        flagLine: flag[j],
                        compLine: compare[i] })
      }
    }
  }
  let removeDups = sameLines.filter((line, index, self) => self.findIndex((t) => {return t.lineNumber === line.lineNumber && t.lineNumber === line.lineNumber; }) === index)
  readResults(removeDups)
}


// GET /repos/:owner/:repo/readme

let flaggedOptions = {
  url: `https://api.github.com/repos/${flaggedPerson}/${flaggedRepo}/contents/${flaggedFile}??client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`,
  headers: {
    'User-Agent': 'Alex-Tideman',
    'Accept': 'application/vnd.github.v3+json'
  }
};

let comparisonOptions = {
  url: `https://api.github.com/repos/${comparisonPerson}/${comparisonRepo}/contents/${comparisonFile}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`,
  headers: {
    'User-Agent': 'Alex-Tideman',
    'Accept': 'application/vnd.github.v3+json'
  }
};


request(flaggedOptions, (error, response, body) => {
  let parseBody = JSON.parse(body)
  let decodedContent = (new Buffer(parseBody["content"], 'base64')).toString('utf8')
  flaggedArray = parseFile(decodedContent)
})

request(comparisonOptions, (error, response, body) => {
  let parseBody = JSON.parse(body)
  let decodedContent = (new Buffer(parseBody["content"], 'base64')).toString('utf8')
  comparisonArray = parseFile(decodedContent)
  compareContent(flaggedArray, comparisonArray)
})
