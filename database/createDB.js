const process = require('process')
const { Client, Pool } = require('pg')
const fs = require("fs");

/*
 * NOTE:
 * Since "pg" uses a driver implementation to interact with postgres,
 * we have to connect to an existing database in order to run psql commands.
 * This includes commands to delete and create databases, so we will connect to
 * the database called "postgres", which has been created by default, in order
 * to create "musixdb".
 */

const createMusixDatabase = async () => {
	// connect to "postgres" database.
	var PGUSER = 'postgres'
	const PGHOST = 'localhost'
	var PGDATABASE = 'postgres'
	const PGPASSWORD = null
	const PGPORT = 5432

	const clientPostgres = new Client({
		user: PGUSER,
		host: PGHOST,
		database: PGDATABASE,
		password: PGPASSWORD,
		port: 5432,
	})
	await clientPostgres.connect()
	.then(() => console.log("Connected successfuly to postgres"))
	.catch( e => console.log(e))

	// attempt to delete "musixdb" database.
	try {
		await clientPostgres.query('DROP DATABASE musixdb')
	}
	catch {
		console.log("Database \"musixdb\" doesn't exist")
	}

	// create "musixdb" database.
	const user = process.env.USER
	try {
		await clientPostgres.query('CREATE DATABASE musixdb WITH OWNER=' + user)
		console.log("Succesfully created database \"musixdb\"")
	}
	catch {
		console.log("Error: could not create database \"musixdb\"")
	}

	await clientPostgres.end()

	// disconnect from "postgres" database connect to "musixdb" database.
	PGUSER = user
	PGDATABASE='musixdb'	

	const pool = new Pool({
		user: PGUSER,
		host: PGHOST,
		database: PGDATABASE,
		password: PGPASSWORD,
		port: 5432,
	})
	await pool.connect()
	.then(() => console.log("Connected successfuly to musixdb"))
	.catch( e => console.log(e))

  // create schema in "musixdb" database.
	try {
		await createMusixSchema(pool)
	}
	catch {
		console.log("Couldn't create musixdb schema")
	}

	await pool.end()
}

/*
 * Create schema in "musixdb" database.
 * @param pool ->
 * @return ->
 */
const createMusixSchema = async (pool) => {
	const sqlText = fs.readFileSync("database/schema.sql").toString()
	console.log(sqlText)
}

module.exports = { createMusixDatabase }
