
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



module.exports = function (app) {
    /*
     * Create a friend request from account_1 (current user) to account_2
     */
    app.post('/friend/request', async (req, res) => {
        try {
            const request = await createFriendRequestController(
                dbCreateFriendRequest, req.account.username, req.body.username)
            
            if (request) {

            }
            else {

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
                dbAcceptFriendRequest, req.account.username, req.body.username)

            if (accept) {

            }
            else {

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
                dbDeclineFriendRequest, req.account.username, req.body,username)
            
            if (decline) {

            }
            else {

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
                dbRemoveFriend, req.account.username, req.body.username)
            
            if (remove) {

            }
            else {

            }
        }
        catch (err) {
            console.log(err)
            res.status(500).send("Internal Server Error")
        }
    })
}