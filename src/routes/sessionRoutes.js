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
	endSessionController,
	validateSessionRequestController
} = require('../controllers/sessionController')

// import database functions
const {
	dbGetAccount,
	dbUpdateStatusAndSessionCode
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
	 * Check session exists from given sessionId
	 * and check user is in current session.
	 */
	app.param('sessionId', async (req, res, next, id) => {
		try {
			const validSessionReq = await validateSessionRequestController(
				redisVerifySessionIdExists,
				redisVerifyParticipantExists,
				id,
				req.account.accountId
			)
			if (validSessionReq.status === FAILURE) {
				res.status(400).send({ error: validSessionReq.error })
			} else {
				next()
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Create new session.
	 */
	app.post('/session', async (req, res) => {
		try {
			const newSession = await createSessionController(
				redisCreateSession,
				redisVerifyProspectHost,
				redisVerifySessionIdExists,
				dbUpdateStatusAndSessionCode,
				req.account.accountId,
				req.body.id,
				req.body.capacity
			)

			if (newSession.status === FAILURE) {
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
	 */
	app.get('/sessions/:sessionId', async (req, res) => {
		try {
			const sessionInfo = await getSessionInfoController(
				redisGetSessionInfo,
				dbGetAccount,
				req.params.sessionId
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
	 * TODO: check if the user joining the session is already a host/in another session
	 */
	app.post('/sessions/:newSessionId/join', async (req, res) => {
		try {
			const joinSession = await joinSessionController(
				redisVerifySessionIdExists,
				redisJoinSession,
				dbUpdateStatusAndSessionCode,
				req.params.newSessionId,
				req.account.accountId
			)

			if (joinSession.status === FAILURE) {
				res.status(400).send({ error: joinSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully joined session ${req.params.newSessionId} as user ${req.account.accountId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Leave a session.
	 * TODO: host should not be able to leave a session - they must end it
	 */
	app.post('/sessions/:sessionId/leave', async (req, res) => {
		console.log("in leave")
		try {
			const leaveSession = await leaveSessionController(
				redisLeaveSession,
				dbUpdateStatusAndSessionCode,
				req.params.sessionId,
				req.account.accountId
			)

			if (leaveSession.status === FAILURE) {
				res.status(400).send({ error: leaveSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully left session ${req.params.sessionId} as user ${req.account.accountId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * End a session.
	 * The user must be the host of the given session.
	 */
	app.post('/sessions/:sessionId/end', async (req, res) => {
		try {
			// TODO: verify fields in req.body.session
			const endSession = await endSessionController(
				redisVerifyHostExists,
				redisEndSession,
				dbCreateSession,
				dbAddSessionParticipant,
				dbUpdateStatusAndSessionCode,
				req.params.sessionId,
				req.account.accountId,
				req.body.session,
				req.body.users
			)

			if (endSession.status === FAILURE) {
				res.status(400).send({ error: endSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully ended session ${req.params.sessionId} as host ${req.account.accountId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}
