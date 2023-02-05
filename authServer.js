// http://localhost:4000
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
