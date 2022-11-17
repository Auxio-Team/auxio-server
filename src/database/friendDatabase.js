const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')



/*
 * Create friend request
 * The current user is sending a request to requested_user
 */
const dbCreateFriendRequest = async (username, requested_user) => {

}


/*
 * Accept friend request
 * The current user is accepting a request from accepted_user
 */
const dbAcceptFriendRequest = async (username, accepted_user) => {

}


/*
 * Decline friend request
 * The current user is declining a request from declined_user
 */
const dbDeclineFriendRequest = async (username, declined_user) => {

}


/*
 * Remove friend
 * The current user is removing a friendship with the removed_user
 */
const dbRemoveFriend = async (username, removed_user) => {

}


module.exports = {
    dbCreateFriendRequest,
    dbAcceptFriendRequest,
    dbDeclineFriendRequest,
    dbRemoveFriend
}