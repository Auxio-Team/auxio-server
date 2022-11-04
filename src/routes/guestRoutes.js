// import redis functions
const {
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession
} = require('../redis/sessionRedis')

const {
	redisGetSessionQueue
} = require('../redis/queueRedis')

// import controller functions
const {
    getSessionInfoController,
    joinSessionController
} = require('../controllers/sessionController')

const {
	getSessionQueueController
} = require('../controllers/queueController')

// import database functions
const {
		dbGetPreferredPlatform
} = require('../database/accountDatabase')

const {
    FAILURE,
} = require('../models/sessionModels')

module.exports = function (app) {
	/*
	 * Get session information.
	 */
	app.get('/guest/sessions/:id', async (req, res) => {
		try {
            const sessionInfo = await getSessionInfoController(
                redisGetSessionInfo,
								dbGetPreferredPlatform,
                req.params.id
            )
			if (sessionInfo == null) {
				res.status(400).send()
			}
			else {
				res.status(200).send(sessionInfo) 
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Join a session.
	 */
	app.put('/guest/session/join', async (req, res) => {
		try {
            const joinSession = await joinSessionController(
                redisVerifySessionIdExists,
                redisJoinSession,
                req.body.id,
                req.body.name
            )
			if (joinSession.status === FAILURE) {
				res.status(400).send({ error: joinSession.error})
			}
			else {
				res.status(200).send() 
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Leave session
	 */

	/* 
	 * End session
	 */

	/*
	 * Get all songs from a session queue.
	 */
	app.get('/sessions/:id/songs', async (req, res) => {
		try {
            const queue = await getSessionQueueController(
				redisVerifySessionIdExists,
                redisGetSessionQueue,
                req.params.id
            )
			if (queue == null) {
				res.status(400).send()
			}
			else {
				res.status(200).send({"queue": queue}) 
				console.log('Successfully retrieved session information')
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

}
