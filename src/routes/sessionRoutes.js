// import redis functions
const {
    redisCreateSession,
    redisVerifyProspectHost,
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession,
	redisVerifyParticipantExists,
	redisLeaveSession
} = require('../redis/sessionRedis')

// import controller functions
const {
    createSessionController,
    getSessionInfoController,
    joinSessionController,
	leaveSessionController
} = require('../controllers/sessionController')

// import database functions
const {
		dbGetPreferredPlatform
} = require('../database/accountDatabase')

const {
    FAILURE,
} = require('../models/sessionModels')

module.exports = function (app) {
	/*
	 * Create new session.
	 */
	app.post('/session', async (req, res) => {
		try {
            const newSession = await createSessionController(
                redisCreateSession,
                redisVerifyProspectHost,
                redisVerifySessionIdExists,
                req.account.username,
				req.body
            )
			if (newSession == null) {
				res.status(400).send()
			}
			else {
				res.status(201).send({ id: newSession.id }) 
				console.log(`Succesfully created session with id ${newSession.id}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get session information.
	 * returns host and preferredPlatform in the body.
	 */
	app.get('/sessions/:id', async (req, res) => {
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
				console.log('Successfully retrieved session information')
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
	app.post('/sessions/:id/join', async (req, res) => {
		try {
            const joinSession = await joinSessionController(
                redisVerifySessionIdExists,
                redisJoinSession,
                req.params.id,
                req.account.username
            )
			if (joinSession.status === FAILURE) {
				res.status(400).send({ error: joinSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully joined session ${req.params.id} as user ${req.account.username}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Leave a session.
	 */
	app.post('/sessions/:id/leave', async (req, res) => {
		try {
            const leaveSession = await leaveSessionController(
                redisVerifySessionIdExists,
				redisVerifyParticipantExists,
                redisLeaveSession,
                req.params.id,
                req.account.username
            )
			if (leaveSession.status === FAILURE) {
				res.status(400).send({ error: leaveSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully left session ${req.params.id} as user ${req.account.username}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * End a session.
	 */
	app.post('/sessions/:id/end', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})
}
