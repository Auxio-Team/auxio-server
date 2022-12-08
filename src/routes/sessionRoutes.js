// import redis functions
const {
	redisCreateSession,
	redisVerifyProspectHost,
	redisVerifySessionIdExists,
	redisGetSessionInfo,
	redisJoinSession,
	redisVerifyParticipantExists,
	redisLeaveSession,
	redisVerifyHostExists,
	redisEndSession
} = require('../redis/sessionRedis')

// import controller functions
const {
	createSessionController,
	getSessionInfoController,
	joinSessionController,
	leaveSessionController,
	endSessionController
} = require('../controllers/sessionController')

// import database functions
const {
	dbGetAccount
} = require('../database/accountDatabase')

const {
	dbCreateSession,
	dbAddSessionParticipant
} = require('../database/historyDatabase')

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
				req.account.accountId,
				req.body.id,
				req.body.capacity
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
				dbGetAccount,
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
				req.account.accountId
			)

			if (joinSession.status === FAILURE) {
				res.status(400).send({ error: joinSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully joined session ${req.params.id} as user ${req.account.accountId}`);
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
				req.account.accountId
			)

			if (leaveSession.status === FAILURE) {
				res.status(400).send({ error: leaveSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully left session ${req.params.id} as user ${req.account.accountId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * End a session.
	 * (this route should only be callable from a host)
	 */
	app.post('/sessions/:id/end', async (req, res) => {
		try {
			// TODO: verify fields in req.body.session
			const endSession = await endSessionController(
				redisVerifySessionIdExists,
				redisVerifyHostExists,
				redisEndSession,
				dbCreateSession,
				dbAddSessionParticipant,
				req.params.id,
				req.account.accountId,
				req.body.session,
				req.body.users
			)

			if (endSession.status === FAILURE) {
				res.status(400).send({ error: endSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully ended session ${req.params.id} as host ${req.account.accountId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}
