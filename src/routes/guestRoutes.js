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
	redisGetCurrentSong,
	redisGetSessionQueue,
	redisVerifySongInQueue,
	redisAddUpvote,
	redisRemoveUpvote
} = require('../redis/queueRedis')

// import controller functions
const {
    getSessionInfoController,
    joinSessionController,
	leaveSessionController
} = require('../controllers/sessionController')

const {
	addSongController,
	getCurrentSongController,
	getSessionQueueController,
	addUpvoteController,
	removeUpvoteController
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
				null,
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
	 * Get current song in a session queue. (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/guest/session/:id/songs/current', async (req, res) => {
		try {
			const getCurr = await getCurrentSongController(
				redisVerifySessionIdExists,
				redisGetCurrentSong,
				req.params.id
			)
			if (getCurr.status === FAILURE) {
				res.status(400).send({ error: getCurr.error })
			}
			else {
				res.status(200).send({ song: getCurr });
				console.log(`Successfully got current song for session ${req.params.id}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Add an upvote (increment priority) to a song in a session queue.
	 */
	app.post('/guest/session/:id/songs/:song_id/upvote', async (req, res) => {
		try {
			const addUpvote = await addUpvoteController(
				redisVerifySessionIdExists,
				redisVerifySongInQueue,
				redisAddUpvote,
				req.params.id,
				req.params.song_id
			)
			if (addUpvote.status === FAILURE) {
				res.status(400).send({ error: addUpvote.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully added upvote to song ${req.params.song_id} in session ${req.params.id}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Remove an upvote (decrement priority) from a song in a session queue.
	 */
	app.delete('/guest/session/:id/songs/:song_id/upvote', async (req, res) => {
		try {
			const removeUpvote = await removeUpvoteController(
				redisVerifySessionIdExists,
				redisVerifySongInQueue,
				redisRemoveUpvote,
				req.params.id,
				req.params.song_id
			)
			if (removeUpvote.status === FAILURE) {
				res.status(400).send({ error: removeUpvote.error })
			}
			else {
				res.status(200).send() 
				console.log(`Successfully removed upvote from song ${req.params.song_id} in session ${req.params.id}`);
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
				null,
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
