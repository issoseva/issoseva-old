const fs = require(`fs`)
const promisify = require(`util`).promisify
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const exec = promisify(require(`child_process`).exec)
const path = require(`path`)
const pug = require(`pug`)
const router = require(`router`)()
const Fieldbook = require(`node-fieldbook`)
const config = require(`../config`)
const book = new Fieldbook(config.fieldbook)
const fieldbookDir = path.normalize(`${__dirname}/../fieldbook`)

// Read at initialization time for caching speed
let indexHtml = ``

async function compileIndexHtml() {
  const infoRows = JSON.parse(await readFile(`${fieldbookDir}/home_page_info.json`))
  const info = infoRows.reduce((info, row) => { info[row.name] = row.value; return info }, {})
  const events = JSON.parse(await readFile(`${fieldbookDir}/events.json`))
  const stats = JSON.parse(await readFile(`${fieldbookDir}/home_page_stats.json`))
  const projects = JSON.parse(await readFile(`${fieldbookDir}/projects.json`))
  const testimonials = []

  // Pre-compile template into memory
  const indexTemplate = pug.compile(await readFile(`${__dirname}/index.pug`))
  indexHtml = indexTemplate({ info, events, stats, projects, testimonials })
  console.log(`Compiled indexHtml ${indexHtml.length} bytes`)
}

// Initial cached compile
compileIndexHtml()

// Router
router.get(`/`, (req, res) => {
  res.setHeader(`Content-Type`, `text/html`)
  res.end(indexHtml)
})

router.get(`/attachments/*`, async (req, res) => {
  const auth = `${config.fieldbook.username}:${config.fieldbook.password}`
  const attachmentUrl = req.url
  //const attachmentPath = path.normalize(`${__dirname}/../fieldbook/attachments`)
  const curlCmd = `curl -sL -u ${auth} https://fieldbook.com${attachmentUrl}`
  console.log(curlCmd)
  try {

    const imageContents = await (exec(curlCmd))
    console.log(Object.keys(imageContents))
    res.setHeader(`Content-Type`, `image/png`)
    res.end(imageContents)

  }catch (e) {
    console.error(e)
  }
})

router.post(`/api/fieldbook-hook`, async (req, res) => {
  console.log(`fieldbook-hook`)
  const hook = req.body
  // console.log(JSON.stringify(hook, null, `  `))

  // We get the change in hook, we should probably modify in place
  // rather than fetching entire table
  // but fetching entire table always gives us most consistent view
  if (hook) {
    const sheet = Object.keys(hook.changes)[0]
    const rows = await book.getSheet(sheet)
    const json = JSON.stringify(rows, null, `  `)
    const jsonFile = `${fieldbookDir}/${sheet}.json`

    // console.log(json)
    fs.writeFileSync(jsonFile, json)
    console.log(`Written ${rows.length} records to ${jsonFile}`)
    compileIndexHtml()
  }

  res.end(``)
})

module.exports = router
