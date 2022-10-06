// http://localhost:4000
const fs = require('fs')
const crypto = require('crypto')
if (!fs.existsSync('./.env')) {
	const accessTokenSecret = crypto.randomBytes(64).toString('hex')
	const refreshTokenSecret = crypto.randomBytes(64).toString('hex')
	const envContent = "ACCESS_TOKEN_SECRET=" + accessTokenSecret
											+ "\nREFRESH_TOKEN_SECRET=" + refreshTokenSecret
	console.log(envContent)
	fs.writeFileSync('.env', envContent)
}

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

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
