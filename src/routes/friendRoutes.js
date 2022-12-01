
// import controllers
const {
    createFriendRequestController,
    acceptFriendRequestController,
    declineFriendRequestController,
    removeFriendController
} = require('../controllers/friendController')

// import database functions
const {
    dbCreateFriendRequest,
    dbAcceptFriendRequest,
    dbDeclineFriendRequest,
    dbRemoveFriend
} = require('../database/friendDatabase')

// Update to use id's instead of usernames

module.exports = function (app) {

    /*
     * Create a friend request from account_1 (current user) to account_2
     */
    app.post('/friend/request', async (req, res) => {
        try {
            console.log("ID: " + req.account.accountId)

            const request = await createFriendRequestController(
                dbCreateFriendRequest, req.account.accountId, req.body.accountId)
            
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
}