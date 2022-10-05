// import redis functions
const {
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession
} = require('../redis/sessionRedis')

// import controller functions
const {
    getSessionInfoController,
    joinSessionController
} = require('../controllers/sessionController')

const {
    FAILURE,
} = require('../models/sessionModels')

module.exports = function (app) {

	/*
	 * Get session information.
	 */
	app.get('/guest/session', async (req, res) => {
		try {
            const sessionInfo = await getSessionInfoController(
                redisGetSessionInfo,
                req.body.id
            )
			if (sessionInfo.host == null) {
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
}

// leave session

// end session