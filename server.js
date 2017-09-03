const connect = require(`connect`)
const config = require(`./config`)
const api = require(`./server/api`)

const app = connect()
app.use(require(`response-time`)())
app.use(require(`compression`)())
app.use(require(`quip`))
app.use(api)
app.use(require(`serve-static`)(`www`))

// Listen for requests
const server = app.listen(config.port, () => {
  console.log(`Serving humanity on port ` + server.address().port)
})
