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
	const PGUSER = process.env.USER
	const PGHOST = 'localhost'
	var PGDATABASE = 'postgres'
	const PGPASSWORD = process.env.PGPASSWORD
	const PGPORT = 5432

	const client = new Client({
		user: PGUSER,
		host: PGHOST,
		database: PGDATABASE,
		password: PGPASSWORD,
		port: PGPORT,
	})
	await client.connect()
	.then(() => console.log("Connected successfully to postgres"))
	.catch( err => console.log(err))

	// attempt to delete "musixdb" database.
	try {
		await client.query('DROP DATABASE musixdb')
	}
	catch (err) {} // musixdb database doesn't exist

	// create "musixdb" database.
	try {
		await client.query('CREATE DATABASE musixdb WITH OWNER=' + PGUSER)
		console.log("Succesfully created database \"musixdb\"")
	}
	catch (err) {
		console.log("Error: could not create database \"musixdb\"")
		console.log(err)
	}

	// disconnect from "postgres" database connect to "musixdb" database.
	await client.end()
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
	.catch(err => console.log(err))

  // create schema in "musixdb" database.
	try {
		await createMusixSchema(pool)
	}
	catch (err) {
		console.log("Couldn't create musixdb schema")
	}

	// close connection to "musixdb" database
	await pool.end()
}

/*
 * Create schema in "musixdb" database.
 * @param pool ->
 * @return ->
 */
const createMusixSchema = async (pool) => {
	const sqlText = fs.readFileSync("src/database/schema.sql").toString()
	console.log(sqlText)
}

module.exports = { createMusixDatabase }
