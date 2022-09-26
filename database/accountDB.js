const { Client, Pool } = require('pg')

const dbCreateAccount = async () => {
	const PGUSER='maxfinder'
	const PGHOST='localhost'
	const PGDATABASE='musixdb'
	const PGPASSWORD=null
	const PGPORT=5432

	const client = new Client({
		user: PGUSER,
		host: PGHOST,
		database: PGDATABASE,
		password: PGPASSWORD,
		port: 5432,
	})
	client.connect()
	.then(() => console.log("Connected successfuly"))
	.catch( e => console.log(e))
	.finally(() => client.end())
}
