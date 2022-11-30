const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')


// Get number of rows updated/deleted (should be 1, if not then error)


/*
 * Get friend list (where we could be either the requester_id or recipient_id)
 * 
 */
const dbGetFriendList = async (user_id) => {
    // select
}

/*
 * Get friend request list (where we are the recipient_id)
 * 
 */
const dbGetFriendRequestList = async (recipient_id) => {
    // select
}

/*
 * Get friend request list and request list (optional)
 * 
 */


/*
 * Create friend request
 * The current user (requester) is sending a request to recipient_id
 * 
 * Returns true if the friend request was added to the database, false otherwise
 */
const dbCreateFriendRequest = async (requester_id, recipient_id) => {
    // possible errors: request already exists between users, 
    //                  friendship already exists between users

    const query = {
		text: "INSERT INTO friendship "
				+ "(requester_id, recipient_id, current_status) "
				+ "VALUES "
				+ "($1, $2, $3);",
		values: [requester_id, recipient_id, 'requested'],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
	return response ? true : false
}


/*
 * Accept friend request
 * The current user (recipient_id) is accepting a request from requester_id
 * 
 * Returns the number of rows updated, which should be 1 on success
 */
const dbAcceptFriendRequest = async (recipient_id, requester_id) => {
	// possible errors: request not in table, already friends

	const query = {
		text: "UPDATE friendship"
				+ "SET current_status = $1"
				+ "WHERE requester_id = $2 AND recipient_id = $3 AND current_status = $4;",
		values: ['friends', requester_id, recipient_id, 'requested'],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()

	return response["rowCount"]
}


/*
 * Decline friend request
 * The current user (recipient_id) is declining a request from requester_id
 * 
 * Returns the number of rows deleted, which should be 1 on success
 */
const dbDeclineFriendRequest = async (recipient_id, requester_id) => {
	// possible errors: request doesn't exist, already friends

	const query = {
		text: "DELETE FROM friendship"
				+ "WHERE requester_id = $1 AND recipient_id = $2 AND current_status = $3;",
		values: [requester_id, recipient_id, 'requested'],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()

	return response["rowCount"]
}


/*
 * Remove friend
 * The current user (user_id) is removing a friendship with the removed_user
 * 
 * Returns the number of rows deleted, which should be 1 on success
 */
const dbRemoveFriend = async (user_id, removed_user_id) => {
	// possible errors: current status is requested, no relationship in the table

	const query = {
		text: "DELETE FROM friendship"
				+ "WHERE requester_id = $1 AND recipient_id = $2 AND current_status = $3"
				+ "OR requester_id = $2 AND recipient_id = $1 AND current_status = $3;",
		values: [user_id, removed_user_id, 'friends'],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()

	return response["rowCount"]
}


module.exports = {
    dbGetFriendList,
    dbGetFriendRequestList,
    dbCreateFriendRequest,
    dbAcceptFriendRequest,
    dbDeclineFriendRequest,
    dbRemoveFriend
}