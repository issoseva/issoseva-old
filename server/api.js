/* eslint no-unused-vars:0 */
const fs = require(`fs`)
const promisify = require(`util`).promisify
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdirp = promisify(require(`mkdirp`))
const requestify = require(`requestify`)
const path = require(`path`)
const pug = require(`pug`)
const router = require(`router`)()
const Fieldbook = require(`node-fieldbook`)
const nodemailer = require(`nodemailer`)
const config = require(`../config`)
const markdown = require( `markdown`).markdown
const bookConfig = config.fieldbook
const book = new Fieldbook(bookConfig)
const fieldbookAttachmentsUrl = `https://fieldbook.com/attachments/${bookConfig.book}/`
const fieldbookDir = path.normalize(`${__dirname}/../fieldbook`)
const attachmentsDir = path.normalize(`${__dirname}/../www/attachments`)
const mailer = nodemailer.createTransport(config.smtp)

// Read at initialization time for caching speed
let indexHtml = ``

async function compileIndexHtml() {
  const infoRows = JSON.parse(await readFile(`${fieldbookDir}/home_page_info.json`))
  const info = infoRows.reduce((info, row) => { info[row.name] = row.value; return info }, {})
  const events = filterEvents(JSON.parse(await readFile(`${fieldbookDir}/events.json`)))
  const stats = JSON.parse(await readFile(`${fieldbookDir}/home_page_stats.json`))
  const projects = JSON.parse(await readFile(`${fieldbookDir}/projects.json`))
  const testimonials = JSON.parse(await readFile(`${fieldbookDir}/testimonials.json`))

  syncFieldbookImages(stats, [`image`])
  syncFieldbookImages(events, [`image`])
  syncFieldbookImages(projects, [`image`] )

  // Pre-compile template into memory
  const indexTemplate = pug.compile(await readFile(`${__dirname}/index.pug`))
  indexHtml = indexTemplate({ info, events, stats, projects, testimonials, mdToHtml })
  console.log(`Compiled indexHtml ${indexHtml.length} bytes`)
}

async function syncFieldbookImages(rows, imageFields) {
  await mkdirp(attachmentsDir)

  for(let row of rows) {
    for (let imageField of imageFields) {
      const imageUrl = row[imageField]
      if (imageUrl && imageUrl.startsWith(fieldbookAttachmentsUrl)) {
        const imagePath = imageUrl.replace(fieldbookAttachmentsUrl, ``).replace(/\//g, `_`) // No slashes
        const attachmentPath = `${attachmentsDir}/${imagePath}`
        row[imageField] = `/attachments/${imagePath}`

        // if (!fs.existsSync(attachmentPath)) {
        //   downloadFieldbookAttachment(imageUrl, attachmentPath)
        // }
      }
    }
  }
}

async function downloadFieldbookAttachment(fileUrl, diskPath) {
  try {
    console.log(`Downloading ${fileUrl}`)
    requestify.responseEncoding(`binary`)
    const resp = await requestify.get(fileUrl, {
      redirect: true,
      auth: {
        username: bookConfig.username,
        password: bookConfig.password
      }
    })

    const fileContents = resp.body
    writeFile(diskPath, fileContents, {encoding: `binary`})
    console.log(`Downloaded ${diskPath} ${fileContents.length} bytes`)
  } catch (e) {
    console.error(e)
  }
}

// Initial cached compile
compileIndexHtml()

function filterEvents(events) {
  const MAX_EVENTS = 6
  return events.sort((a, b) => {
    return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
  }).filter(event => {
    if (!event.date) return false

    let eventDateTime = new Date(event.date)
    eventDateTime.setHours(23)
    eventDateTime.setMinutes(59)

    return eventDateTime > new Date()
  }).slice(0, MAX_EVENTS)
}

// Router
router.get(`/`, (req, res) => {
  res.setHeader(`Content-Type`, `text/html`)
  res.end(indexHtml)
  compileIndexHtml()
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
    await writeFile(jsonFile, json)
    console.log(`Written ${rows.length} records to ${jsonFile}`)
    compileIndexHtml()
  }

  res.end(``)
})

router.post(`/api/email`, async (req, res) => {
  const formData = req.body
  res.setHeader(`Content-Type`, `application/json`)

  if (isValidFormData(formData)) {
    const {name = ``, email, message} = formData

    const mailOptions = {
      from: `"ISSO Seva Mailer" <mailer@issoseva.org>`,
      to: `hello@issoseva.org`,
      subject: `Contact us message from ${name} <${email}>`,
      text: message,
      html: `<div>${name}</div><br/><div>${email}</div><br/><br/><div>${message}</div>`
    }

    mailer.sendMail(mailOptions, (error) => {
      if (error) {
        return res.end(JSON.stringify({error: error.errorMessage}))
      }

      res.end(JSON.stringify({success: true}))
    })

  } else {
    return res.end(JSON.stringify({error: `Invalid Form Data`}))
  }

})

function isValidFormData(formData) {
  return formData.email &&
    formData.email.match(/^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/) &&
    formData.message
}

function mdToHtml(md) {
  try {
    return markdown.toHTML(md)
  } catch (e) {
    console.error(new Date(), e)
    return `<p>${md}</p>`
  }
}

module.exports = router
