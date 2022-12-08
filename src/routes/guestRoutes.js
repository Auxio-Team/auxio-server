// import redis functions
const {
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession,
	redisVerifyParticipantExists,
	redisLeaveSession,
} = require('../redis/sessionRedis')

const {
	redisAddSongToSession,
	redisGetSessionQueue
} = require('../redis/queueRedis')

// import controller functions
const {
    getSessionInfoController,
    joinSessionController,
	leaveSessionController
} = require('../controllers/sessionController')

const {
	addSongController,
	getSessionQueueController
} = require('../controllers/queueController')

// import database functions
const {
	dbGetAccount
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
				dbGetAccount,
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
	app.post('/guest/session/:id/leave', async (req, res) => {
		try {
            const leaveSession = await leaveSessionController(
                redisVerifySessionIdExists,
				redisVerifyParticipantExists,
                redisLeaveSession,
				req.params.id,
                req.body.name
            )
			if (leaveSession.status === FAILURE) {
				res.status(400).send({ error: leaveSession.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully left session ${req.body.id} as user ${req.body.name}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Add song to a session queue.
	 * 
	 * body format:
	 * {
	 *    song: <str_song_id>
	 * }
	 */
	app.post('/guest/session/:id/song', async (req, res) => {
		try {
			const addSong = await addSongController(
				redisVerifySessionIdExists,
				redisAddSongToSession,
				req.params.id,
				req.body.song
			)
			if (addSong.status === FAILURE) {
				res.status(400).send({ error: addSong.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully added song to queue for session ${req.params.id}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/* 
	 * End session
	 */

	/*
	 * Get all songs from a session queue.
	 */
	app.get('/guest/session/:id/songs', async (req, res) => {
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
