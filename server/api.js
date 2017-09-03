const fs = require(`fs`)
const path = require(`path`)
const bodyParser = require(`body-parser`)
const quip = require(`quip`)
const pug = require(`pug`)
const router = require(`router`)()
const Fieldbook = require(`node-fieldbook`)
const config = require(`../config`)

const book = new Fieldbook(config.fieldbook)
const fieldbookDir = path.normalize(`${__dirname}/../fieldbook`)

// Read at initialization time for caching speed
const infoRows = JSON.parse(fs.readFileSync(`${fieldbookDir}/home_page_info.json`))
const info = infoRows.reduce((info, row) => { info[row.name] = row.value; return info }, {})
const events = JSON.parse(fs.readFileSync(`${fieldbookDir}/events.json`))
const stats = JSON.parse(fs.readFileSync(`${fieldbookDir}/home_page_stats.json`))
const projects = JSON.parse(fs.readFileSync(`${fieldbookDir}/projects.json`))
const testimonials = []

// Pre-compile template into memory
const indexTemplate = pug.compile(fs.readFileSync(`${__dirname}/index.pug`))
const indexHtml = indexTemplate({ info, events, stats, projects, testimonials })

// Router
router.use(bodyParser.json())
router.use(quip)

router.get(`/`, async (req, res) => {
  res.html(indexHtml)
})

router.post(`/api/fieldbook-hook`, async (req, res) => {
  console.log(`fieldbook-hook`)
  const hook = req.body
  console.log(JSON.stringify(hook, null, `  `))

  // We get the change in hook, we should probably modify in place
  // rather than fetching entire table
  // but fetching entire table always gives us most consistent view
  if (hook) {
    const sheet = Object.keys(hook.changes)[0]
    const rows = await book.getSheet(sheet)
    const json = JSON.stringify(rows, null, `  `)
    const jsonFile = `${fieldbookDir}/${sheet}.json`
    console.log(json)
    fs.writeFileSync(jsonFile, json)
    console.log(`Written ${rows.length} records to ${jsonFile}`)
  }

  res.end()
})

module.exports = router
