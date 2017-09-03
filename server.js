const connect = require(`connect`)
const static = require(`serve-static`)
const quip = require(`quip`)
const compression = require(`compression`)
const bodyParser = require(`body-parser`)
const responseTime = require(`response-time`)
const config = require(`./server/config`)
const api = require(`./server/api`)

const app = connect()
app.use(responseTime())
app.use(compression())
app.use(quip)
app.use(api)
app.use(static(`www`))

// Listen for requests
const server = app.listen(config.port, () => {
  console.log(`Serving humanity on port ` + server.address().port)
})
