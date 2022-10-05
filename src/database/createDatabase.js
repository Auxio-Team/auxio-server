const process = require('process')
//const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')
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
	const client = createClient('postgres')
	await client.connect()
	.then(() => console.log("Connected successfully to postgres"))
	.catch( err => console.log(err))

	// attempt to delete "musixdb" database.
	try {
		await client.query('DROP DATABASE musixdb')
	}
	catch (err) {
		console.log("Error while dropping: " + err)
	} // musixdb database doesn't exist

	// create "musixdb" database.
	try {
		await client.query('CREATE DATABASE musixdb WITH OWNER=' + process.env.USER)
		console.log("Succesfully created database \"musixdb\"")
	}
	catch (err) {
		console.log("Error: could not create database \"musixdb\"")
		console.log(err)
	}

	// disconnect from "postgres" database.
	await client.end()

  // create schema in "musixdb" database.
	try {
		await createMusixSchema()
		console.log("CREATED SCHEMA")
	}
	catch (err) {
		console.log("Couldn't create musixdb schema")
	}
}

/*
 * Create schema in "musixdb" database.
 * @param pool -> 
 */
const createMusixSchema = async () => {
	const sqlText = fs.readFileSync("src/database/schema.sql").toString()
	console.log(sqlText)

	const pool = createPool('musixdb')
	pool.connect()
	.then(client => {
		console.log("Connected successfuly to musixdb")
    return client
      .query(sqlText)
      .then(res => {
        client.release()
      })
      .catch(err => {
        client.release()
        console.log(err.stack)
      })
  })
	.catch(err => {
		console.log("Error creating schema: " + err)
	})

	// close connection to "musixdb" database
	await pool.end()
}

module.exports = { createMusixDatabase }
