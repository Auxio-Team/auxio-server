const process = require('process')
const { Client, Pool } = require('pg')

// connect to "postgres" database.
const PGUSER = process.env.USER
const PGHOST = 'localhost'
const PGPASSWORD = process.env.PGPASSWORD
const PGPORT = 5432

const createClient = (pgdatabase) => {
	const client = new Client({
		user: PGUSER,
		host: PGHOST,
		database: pgdatabase,
		password: PGPASSWORD,
		port: PGPORT,
	})
	return client
}

const createPool = (pgdatabase) => {
	const pool = new Pool({
		user: PGUSER,
		host: PGHOST,
		database: pgdatabase,
		password: PGPASSWORD,
		port: PGPORT,
	})
	return pool
}

module.exports = {
	createClient,
	createPool
}


