const {
	NOT_FRIENDS,
	SENT_REQUEST,
    RECIEVED_REQUEST,
    FRIENDS,
	ME
} = require('../models/friendModels')

/*
 * Get list of friends
 */
const getFriendListController = async (dbGetFriendList, accountId) => {
    const friendList = await dbGetFriendList(accountId)
    return friendList
}

/*
 * Get list of incoming friend requests
 */
const getFriendRequestListController = async (dbGetFriendRequestList, accountId) => {
    const requestList = await dbGetFriendRequestList(accountId)
    return requestList
}

/*
 * Create a friend request by creating a row in the friendship table
 */
const createFriendRequestController = async (dbCreateFriendRequest, accountId, recipientId) => {
    if (accountId === recipientId) {
        return null
    }
    const requested = await dbCreateFriendRequest(accountId, recipientId)
    return requested
}


/*
 * Accept a friend request by changing the status of the row in the friendship table to friends
 */
const acceptFriendRequestController = async (dbAcceptFriendRequest, accountId, requesterId) => {
    if (accountId === requesterId) {
        return null
    }
    const rowsUpdated = await dbAcceptFriendRequest(accountId, requesterId)
    return rowsUpdated
}


/*
 * Decline a friend request by deleting a row in the friendship table
 */
const declineFriendRequestController = async (dbDeclineFriendRequest, accountId, requesterId) => {
    if (accountId === requesterId) {
        return null
    }
    const rowsDeleted = await dbDeclineFriendRequest(accountId, requesterId)
    return rowsDeleted
}


/*
 * Remove a friend request by deleting a row in the friendship table
 */
const removeFriendController = async (dbRemoveFriend, accountId, removedAccountId) => {
    if (accountId === removedAccountId) {
        return null
    }
    const rowsDeleted = await dbRemoveFriend(accountId, removedAccountId)
    return rowsDeleted
}


/*
 * Remove a friend request by deleting a row in the friendship table
 */
const cancelFriendRequestController = async (dbCancelFriendRequest, accountId, otherAccountId) => {
    if (accountId === otherAccountId) {
        return null
    }
    const rowsDeleted = await dbCancelFriendRequest(accountId, otherAccountId)
    return rowsDeleted
}


/*
 * Get the friendship status by getting the row in the friendship table
 */
const getFriendshipStatusController = async (dbGetFriendshipStatus, accountId, otherAccountId) => {
    if (accountId === otherAccountId) {
        return ME
    }
    
    const response = await dbGetFriendshipStatus(accountId, otherAccountId)

    if (response["rowCount"] === 0) {
		return NOT_FRIENDS
	}
	else if (response["rowCount"] === 1) {
		if (response.rows[0].current_status == "friends") {
			return FRIENDS
		}
		else if (response.rows[0].requesterId == accountId){
			return SENT_REQUEST
		}
		else {
			return RECIEVED_REQUEST
		}
	}
	else {
		return null
	}
}


/*
 * Get the friendship status by getting the row in the friendship table
 */
const getFriendCountController = async (dbGetFriendCount, accountId) => {
    const friendCount = await dbGetFriendCount(accountId)
    return friendCount
}

module.exports = {
    getFriendListController,
    getFriendRequestListController,
    createFriendRequestController,
    acceptFriendRequestController,
    declineFriendRequestController,
    removeFriendController,
    cancelFriendRequestController,
    getFriendshipStatusController,
    getFriendCountController
}