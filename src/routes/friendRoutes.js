
// import controllers
const {
    createFriendRequestController,
    acceptFriendRequestController,
    declineFriendRequestController,
    removeFriendController,
    cancelFriendRequestController,
    getFriendListController,
    getFriendRequestListController,
    getFriendshipStatusController,
    getFriendCountController
} = require('../controllers/friendController')

// import database functions
const {
    dbCreateFriendRequest,
    dbAcceptFriendRequest,
    dbDeclineFriendRequest,
    dbRemoveFriend,
    dbCancelFriendRequest,
    dbGetFriendList,
    dbGetFriendRequestList,
    dbGetFriendshipStatus,
    dbGetFriendCount
} = require('../database/friendDatabase')

// Update to use id's instead of usernames

module.exports = function (app) {

    /*
     * Get list of friends
     */
    app.get('/friend/friendlist', async (req, res) => {
        try {
            const friendList = await getFriendListController(
                dbGetFriendList, 
                req.account.accountId
            )
            
            if (friendList) {
                console.log("Got friend list for: " + req.account.accountId)
				res.status(200).send({ "friendlist": friendList })
            }
            else {
                res.status(400).send({ 'message': 'Unable to get friend list' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Get list of friend requests
     */
    app.get('/friend/requestlist', async (req, res) => {
        try {
            const requestList = await getFriendRequestListController(
                dbGetFriendRequestList, req.account.accountId)
            
            if (requestList) {
                console.log("Got friend request list for: " + req.account.accountId)
				res.status(200).send({ "requestlist": requestList })
            }
            else {
                res.status(400).send({ 'message': 'Unable to get friend request list' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Create a friend request from account_1 (current user) to account_2
     */
    app.post('/friend/request', async (req, res) => {
        try {
            const request = await createFriendRequestController(
                dbCreateFriendRequest, 
                req.account.accountId, 
                req.body.accountId
            )
            
            if (request) {
                console.log("Sent friend request to: " + req.body.accountId)
				res.status(200).send()
            }
            else {
                res.status(400).send({ 'message': 'Unable to send friend request' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Accept a friend request from account_1 as account_2 (current user)
     */
    app.post('/friend/accept', async (req, res) => {
        try {
            const accept = await acceptFriendRequestController(
                dbAcceptFriendRequest, req.account.accountId, req.body.accountId)

            if (accept === 1) {
                console.log("Accepted friend request from: " + req.body.accountId)
				res.status(200).send()
            }
            else {
                res.status(400).send({ 'message': 'Unable to accept friend request' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Decline a friend request from account_1 as account_2 (current user)
     */
    app.post('/friend/decline', async (req, res) => {
        try {
            const decline = await declineFriendRequestController(
                dbDeclineFriendRequest, req.account.accountId, req.body.accountId)
            
            if (decline === 1) {
                console.log("Declined friend request from: " + req.body.accountId)
				res.status(200).send()
            }
            else {
                res.status(400).send({ 'message': 'Unable to decline friend request' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Remove a friend account_1/account_2 as account_2/account_1 (current user)
     */
    app.post('/friend/remove', async (req, res) => {
        try {
            const remove = await removeFriendController(
                dbRemoveFriend, req.account.accountId, req.body.accountId)
            
            if (remove === 1) {
                console.log("Removed friend: " + req.body.accountId)
				res.status(200).send()
            }
            else {
                res.status(400).send({ 'message': 'Unable to remove friend' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Cancel a friend request sent to another user
     */
    app.post('/friend/cancel', async (req, res) => {
        try {
            const canceled = await cancelFriendRequestController(
                dbCancelFriendRequest, req.account.accountId, req.body.accountId)
            
            if (canceled === 1) {
                console.log("Friend request to " + req.body.accountId + " canceled")
				res.status(200).send()
            }
            else {
                res.status(400).send({ 'message': 'Unable to cancel friend request' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Get friendship status
     */
    app.get('/friend/status/:accountId', async (req, res) => {
        try {
            const friendshipStatus = await getFriendshipStatusController(
                dbGetFriendshipStatus, 
                req.account.accountId, 
                req.params.accountId
            )

            if (friendshipStatus) {
                console.log("Friendship status between " + req.account.accountId + " and "
                    + req.params.accountId + ": " + friendshipStatus)
                res.status(200).send({ "status": friendshipStatus })
            }
            else {
                res.status(400).send({ 'message': 'Unable to get friendship status' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })


    /*
     * Get friend count
     */
    app.get('/friend/count/me', async (req, res) => {
        try {
            const friendCount = await getFriendCountController(
                dbGetFriendCount, req.account.accountId)

            if (friendCount >= 0) {
                console.log("Friend count for user " + req.account.accountId + ": " + friendCount)
                res.status(200).send({ "count": friendCount })
            }
            else {
                res.status(400).send({ 'message': 'Unable to get friend count' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })

    /*
     * Get friend count for user with accountId specified
     */
    app.get('/friend/count/:accountId', async (req, res) => {
        try {
            const friendCount = await getFriendCountController(
                dbGetFriendCount, 
                req.params.accountId
            )

            if (friendCount >= 0) {
                console.log("Friend count for user " + req.params.accountId + ": " + friendCount)
                res.status(200).send({ "count": friendCount })
            }
            else {
                res.status(400).send({ 'message': 'Unable to get friend count' })
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })

}