// http://localhost:4000
const fs = require('fs')
const crypto = require('crypto')
if (!fs.existsSync('./.env')) {
	const accessTokenSecret = crypto.randomBytes(64).toString('hex')
	const refreshTokenSecret = crypto.randomBytes(64).toString('hex')
	const codeTokenSecret = crypto.randomBytes(64).toString('hex')
	const passwordTokenSecret = crypto.randomBytes(64).toString('hex')
	const twilioAccountSid = "ACd8f103d7ea7aaa411ac76e7929c4836c";
	const twilioAuthToken = "f29bf59961befe551857738091b4d7fe";
	const envContent = "ACCESS_TOKEN_SECRET=" + accessTokenSecret
		+ "\nREFRESH_TOKEN_SECRET=" + refreshTokenSecret
		+ "\nCODE_TOKEN_SECRET=" + codeTokenSecret 
		+ "\nPASSWORD_TOKEN_SECRET=" + passwordTokenSecret
		+ "\nTWILIO_ACCOUNT_SID=" + twilioAccountSid
		+ "\nTWILIO_AUTH_TOKEN=" + twilioAuthToken
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
