

/*
 * Create a friend request by creating a row in the friendship table
 */
const createFriendRequestController = async (dbCreateFriendRequest, username, requested_user) => {
    const request = await dbCreateFriendRequest(username, requested_user)

    if (request) {

    }
    else {

    }
}


/*
 * Accept a friend request by changing the status of the row in the friendship table to friends
 */
const acceptFriendRequestController = async (dbAcceptFriendRequest, username, accepted_user) => {
    const accept = await dbAcceptFriendRequest(username, accepted_user)

    if (accept) {

    }
    else {
        
    }
}


/*
 * Decline a friend request by deleting a row in the friendship table
 */
const declineFriendRequestController = async (dbDeclineFriendRequest, username, declined_user) => {
    const decline = await dbDeclineFriendRequest(username, declined_user)

    if (decline) {

    }
    else {
        
    }
}


/*
 * Remove a friend request by deleting a row in the friendship table
 */
const removeFriendController = async (dbRemoveFriend, username, removed_user) => {
    const remove = await dbRemoveFriend(username, removed_user)

    if (remove) {

    }
    else {
        
    }
}



module.exports = {
    createFriendRequestController,
    acceptFriendRequestController,
    declineFriendRequestController,
    removeFriendController
}