const fs = require(`fs`)
const path = require(`path`)
// const promisify = require(`util`).promisify
// const readFile = promisify(fs.readFile)
const pug = require(`pug`)
const router = require(`router`)()
const fieldbookDir = path.normalize(`${__dirname}/../fieldbook`)
const indexTemplate = pug.compile(fs.readFileSync(`${__dirname}/index.pug`))

// Read at initialization time for caching speed
const infoRows = JSON.parse(fs.readFileSync(`${fieldbookDir}/home_page_info.json`))
const info = infoRows.reduce((info, row) => { info[row.name] = row.value; return info }, {})
const events = JSON.parse(fs.readFileSync(`${fieldbookDir}/events.json`))
const stats = JSON.parse(fs.readFileSync(`${fieldbookDir}/home_page_stats.json`))
const projects = JSON.parse(fs.readFileSync(`${fieldbookDir}/projects.json`))
const testimonials = []

router.get(`/`, async (req, res) => {
  res.html(indexTemplate({info, events, stats, projects, testimonials}))
})

module.exports = router
