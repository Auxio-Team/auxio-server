// http://localhost:4000
require('dotenv').config()
const process = require('process')

/* run app on port 4000 */
const express = require('express')
const app = express()
const port = 4000

/* parse request body as json */
app.use(express.json())

/* import routes */
require('./src/routes/authRoutes')(app)

// TODO: we want to store refresh tokens in database.
// for now use local list of refresh tokens
var refreshTokens = []

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
