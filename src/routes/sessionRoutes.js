// import redis functions
const {
    redisCreateSession,
    redisVerifyProspectHost,
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession
} = require('../redis/sessionRedis')

// import controller functions
const {
    createSessionController,
    getSessionInfoController,
    joinSessionController
} = require('../controllers/sessionController')

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
                req.account.username
            )
			if (newSession == null) {
				res.status(400).send()
			}
			else {
				res.status(201).send(newSession.id) 
				console.log('Succesfully created session with id ' + newSession.id);
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
	app.get('/sessions/:id', async (req, res) => {
		try {
            const sessionInfo = await getSessionInfoController(
                redisGetSessionInfo,
                req.params.id
            )
			if (sessionInfo.host == null) {
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
	app.put('/session/join', async (req, res) => {
		try {
            const joinSession = await joinSessionController(
                redisVerifySessionIdExists,
                redisJoinSession,
                req.body.id,
                req.account.username
            )
			if (joinSession.status === FAILURE) {
				res.status(400).send({ error: joinSession.error })
			}
			else {
				res.status(200).send() 
				console.log('Successfully joined session ' + req.body.id + ' as user ' + req.account.username);
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