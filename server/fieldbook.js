const promisify = require(`util`).promisify
const fs = require(`fs`)
const path = require(`path`)
const writeFile = promisify(fs.writeFile)
const Fieldbook = require(`node-fieldbook`)
const config = require(`./config`)

const book = new Fieldbook(config.fieldbook)
const fieldbookDir = path.normalize(`${__dirname}/../fieldbook`)

async function main() {
  const sheets = await book.getSheets()
  for(let sheet of sheets) {
    const rows = await book.getSheet(sheet)
    console.log(sheet, rows)
    const json = JSON.stringify(rows, null, `  `)
    await writeFile(`${fieldbookDir}/${sheet}.json`, json)
  }
}
main()
