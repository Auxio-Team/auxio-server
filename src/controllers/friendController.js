

/*
 * Get list of friends
 */
const getFriendListController = async (dbGetFriendList, user_id) => {
    const friend_list = await dbGetFriendList(user_id)

    return friend_list
}

/*
 * Get list of incoming friend requests
 */
const getFriendRequestListController = async (dbGetFriendRequestList, user_id) => {
    const request_list = await dbGetFriendRequestList(user_id)

    return request_list
}

/*
 * Create a friend request by creating a row in the friendship table
 */
const createFriendRequestController = async (dbCreateFriendRequest, user_id, recipient_id) => {
    if (user_id === recipient_id) {
        return null
    }
    
    const requested = await dbCreateFriendRequest(user_id, recipient_id)

    return requested
}


/*
 * Accept a friend request by changing the status of the row in the friendship table to friends
 */
const acceptFriendRequestController = async (dbAcceptFriendRequest, user_id, requester_id) => {
    if (user_id === requester_id) {
        return null
    }
    
    const rows_updated = await dbAcceptFriendRequest(user_id, requester_id)

    return rows_updated
}


/*
 * Decline a friend request by deleting a row in the friendship table
 */
const declineFriendRequestController = async (dbDeclineFriendRequest, user_id, requester_id) => {
    if (user_id === requester_id) {
        return null
    }
    
    const rows_deleted = await dbDeclineFriendRequest(user_id, requester_id)

    return rows_deleted
}


/*
 * Remove a friend request by deleting a row in the friendship table
 */
const removeFriendController = async (dbRemoveFriend, user_id, removed_user_id) => {
    if (user_id === removed_user_id) {
        return null
    }
    
    const rows_deleted = await dbRemoveFriend(user_id, removed_user_id)

    return rows_deleted
}


/*
 * Get the friendship status by getting the row in the friendship table
 */
const getFriendshipStatusController = async (dbGetFriendshipStatus, user_id, other_user_id) => {
    if (user_id === other_user_id) {
        return null
    }

    const friendship_status = await dbGetFriendshipStatus(user_id, other_user_id)

    return friendship_status
}


/*
 * Get the friendship status by getting the row in the friendship table
 */
const getFriendCountController = async (dbGetFriendCount, user_id) => {
    const friend_count = await dbGetFriendCount(user_id)

    return friend_count
}

module.exports = {
    getFriendListController,
    getFriendRequestListController,
    createFriendRequestController,
    acceptFriendRequestController,
    declineFriendRequestController,
    removeFriendController,
    getFriendshipStatusController,
    getFriendCountController
}