const connect = require(`connect`)
const static = require(`serve-static`)
const config = require(`./config`)

const app = connect()
app.use(static(`www`))

// Listen for requests
const server = app.listen(config.port, () => {
  console.log(`Serving humanity on port ` + server.address().port)
})
