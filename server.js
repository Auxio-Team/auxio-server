// http://localhost:3000

const process = require('process')

/* run app on port 3000 */
const express = require('express')
const app = express()
const port = 3000

/* Parse request body as json */
const bodyParser = require('body-parser')
app.use(bodyParser.json())

/* import routes */
require('./routes/accountRoutes')(app)

// TODO: setup AWS connection to use non-local database
var environment = getEnvironment()
console.log("environment: " + environment)

/* listen on server */
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

/* determines the environment to run the server on (which database to use) */
function getEnvironment() {
	if (process.argv.length > 3) {
		console.log("Invalid number of arguments. Expected form: \"node server <environment>\"")
		return -1
	}
	else if (process.argv.length == 3 && process.argv[2] == 'dev') {
		return 'dev'	
	}
	else {
		return 'local'
	}
}
