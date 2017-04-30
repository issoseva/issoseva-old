const express = require('express')
const static = require('express-static')

const app = express()
app.use(static('www'))

// Listen for requests
const server = app.listen(80, () => {
    const port = server.address().port
    console.log('Serving humanity on port ' + port)
});