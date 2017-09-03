const fs = require(`fs`)
const path = require(`path`)
// const promisify = require(`util`).promisify
// const readFile = promisify(fs.readFile)
const pug = require(`pug`)
const router = require(`router`)()
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

router.get(`/`, async (req, res) => {
  res.html(indexHtml)
})

router.post(`/api/fieldbook-hook`, (req, res) => {
  console.log(`fieldbook-hook`)
  console.log(req.body)
  res.end()
})

module.exports = router
