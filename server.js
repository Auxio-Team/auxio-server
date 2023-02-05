// http://localhost:3000
const fs = require('fs')
const awsSecretsManager = require('@aws-sdk/client-secrets-manager')

const getSecrets = async () => {
	// If you need more information about configurations or implementing the sample code, visit the AWS docs:
	// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

	const secret_name = "Auxio_server_secrets";

	const client = new awsSecretsManager.SecretsManagerClient({
		region: "us-east-2",
	});

	let response;

	try {
		response = await client.send(
			new awsSecretsManager.GetSecretValueCommand({
				SecretId: secret_name,
				VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
			})
		);
	} catch (error) {
		// For a list of exceptions thrown, see
		// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
		throw error;
	}

	const secrets = JSON.parse(response.SecretString);
	const envContent = "\nACCESS_TOKEN_SECRET=" + secrets.access_token_secret
		+ "\nREFRESH_TOKEN_SECRET=" + secrets.refresh_token_secret
		+ "\nCODE_TOKEN_SECRET=" + secrets.code_token_secret 
		+ "\nPASSWORD_TOKEN_SECRET=" + secrets.password_token_secret
	fs.appendFileSync('.env', envContent)
}

if (!fs.existsSync('./.env')) {
	const twilioAccountSid = "ACd8f103d7ea7aaa411ac76e7929c4836c";
	const twilioAuthToken = "f29bf59961befe551857738091b4d7fe";
	const envContent = "TWILIO_ACCOUNT_SID=" + twilioAccountSid
		+ "\nTWILIO_AUTH_TOKEN=" + twilioAuthToken
	fs.writeFileSync('.env', envContent)
	getSecrets()
}

require('dotenv').config()
const process = require('process')
const jwt = require('jsonwebtoken')
const { createAuxioDatabase } = require('./src/database/createDatabase')

/* run app on port 3000 */
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');

/* middleware handlers */
app.use(express.json())
app.use(cors({
	origin: '*'
}))

/* multer setup for image storing */
const multer = require('multer');

const upload = multer({storage: multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './pictures');
      },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})});

/*
 * Test creating a new postgres database and connecting to it.
 * Create .env file with new Token Secrets
 * TODO: dev env only
 */
app.get('/', async (req, res) => {
	try {
		await createAuxioDatabase()
		res.status(200).send()
	}
	catch (err) {
		console.log(err)
		res.status(500).send("Internal Server Error")
	}
})

/*
 * Middleware function that authenticates a request.
 * 1. get the token they send us (it will come from the header).
 * 2. verify that this is the correct user.
 * 3. return that user
 */
app.use((req, res, next) => {
	// create account bypass authorization
	if (req.path.split('/')[1] == 'account' && req.path.split('/').length == 2 && req.method == 'POST') {
		return next();
	}

	// 'authorization': 'Bearer TOKEN'
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	// check if there is a token
	if (token == null) {
		console.log("Unauthorized")
		return res.status(401).send()
	}

	// verify the token is valid
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, account) => {
		if (err) {
			console.log("Forbidden")
			return res.status(401).send()
		}
		req.account = account
		next()
	})
})

/* import routes */
require('./src/routes/accountRoutes')(app, upload)
require('./src/routes/guestRoutes')(app)
require('./src/routes/sessionRoutes')(app)
require('./src/routes/queueRoutes')(app)
require('./src/routes/friendRoutes')(app)

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
