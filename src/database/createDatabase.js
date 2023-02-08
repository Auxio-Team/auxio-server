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
 * to create "auxiodb".
 */

const createAuxioDatabase = async () => {
	const client = createClient('postgres')
	await client.connect()
	.then(() => console.log("Connected successfully to postgres"))
	.catch( err => console.log(err))

	// attempt to delete "auxiodb" database.
	try {
		await client.query('DROP DATABASE auxiodb')
	}
	catch (err) {
		console.log("Error while dropping: " + err)
	} // auxiodb database doesn't exist

	// create "auxiodb" database.
	try {
		await client.query('CREATE DATABASE auxiodb WITH OWNER=postgres')
		console.log("Succesfully created database \"auxiodb\"")
	}
	catch (err) {
		console.log("Error: could not create database \"auxiodb\"")
		console.log(err)
	}

	// disconnect from "postgres" database.
	await client.end()

  // create schema in "auxiodb" database.
	try {
		await createAuxioSchema()
		console.log("CREATED SCHEMA")
	}
	catch (err) {
		console.log("Couldn't create auxiodb schema")
	}
}

/*
 * Create schema in "auxiodb" database.
 * @param pool -> 
 */
const createAuxioSchema = async () => {
	const sqlText = fs.readFileSync("src/database/schema.sql").toString()
	console.log(sqlText)

	const pool = createPool('auxiodb')
	pool.connect()
	.then(client => {
		console.log("Connected successfuly to auxiodb")
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

	// close connection to "auxiodb" database
	await pool.end()
}

module.exports = { createAuxioDatabase }
