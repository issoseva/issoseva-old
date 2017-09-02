const connect = require(`connect`)
const static = require(`serve-static`)
const config = require(`./server/config`)
const api = require(`./server/api`)

const app = connect()
app.use(`/`, api)
app.use(`/`, static(`www`))

console.log(connect, `adsf`)

// Listen for requests
const server = app.listen(config.port, () => {
  console.log(`Serving humanity on port ` + server.address().port)
})
