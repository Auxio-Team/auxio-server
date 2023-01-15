// import redis functions
const {
	redisVerifyHostExists
} = require('../redis/sessionRedis')

const {
	redisAddSongToSession,
	redisDequeueSongFromSession,
	redisVerifySongInQueue,
	redisAddUpvote,
	redisRemoveUpvote,
	redisRemoveSong
} = require('../redis/queueRedis')

// import controller functions
const {
	addSongController,
	dequeueSongController,
	addUpvoteController,
	removeUpvoteController,
	removeSongController,
	validateSongReqController
} = require('../controllers/queueController')

// import models 
const {
    FAILURE,
} = require('../models/queueModels')

module.exports = function (app) {
	/*
	 * Check song id exists in current queue
	 */
	app.param('songId', async (req, res, next, id) => {
		try {
			const validSongReq = await validateSongReqController(
				redisVerifySongInQueue,
				req.params.sessionId,
				id
			)
			if (validSongReq.status === FAILURE) {
				res.status(400).send({ error: validSongReq.error })
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
	 * Add song to a session queue.
	 */
	app.post('/sessions/:sessionId/song', async (req, res) => {
		try {
            const addSong = await addSongController(
				redisAddSongToSession,
                req.params.sessionId,
                req.body.song
            )
			if (addSong.status === FAILURE) {
				res.status(400).send({ error: addSong.error })
			}
			else {
				res.status(204).send() 
				console.log(`Successfully added song to queue for session ${req.params.sessionId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Remove a song from the session queue.
	 */
	app.delete('/sessions/:sessionId/songs/:songId', async (req, res) => {
		try {
            const removeSong = await removeSongController(
				redisRemoveSong,
                req.params.sessionId,
                req.params.songId
            )
			if (removeSong.status === FAILURE) {
				res.status(400).send({ error: removeSong.error })
			}
			else {
				res.status(204).send() 
				console.log(`Successfully removed song from queue for session ${req.params.sessionId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Add an upvote (increment priority) to a song in a session queue.
	 * NOTE: the backend route allows the same user to upvote as many times as they want (should this be checked?)
	 */
	app.post('/sessions/:sessionId/songs/:songId/upvote', async (req, res) => {
		try {
            const addUpvote = await addUpvoteController(
				redisAddUpvote,
                req.params.sessionId,
                req.params.songId
            )
			if (addUpvote.status === FAILURE) {
				res.status(400).send({ error: addUpvote.error })
			}
			else {
				res.status(204).send() 
				console.log(`Successfully added upvote to song ${req.params.songId} in session ${req.params.sessionId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Remove an upvote (decrement priority) from a song in a session queue.
	 * NOTE: the backend route allows the same user to remove an upvote as many times as they want as long as the number of upvotes stays above 0 (should this be checked?)
	 */
	app.delete('/sessions/:sessionId/songs/:songId/upvote', async (req, res) => {
		try {
            const removeUpvote = await removeUpvoteController(
				redisRemoveUpvote,
                req.params.sessionId,
                req.params.songId
            )
			if (removeUpvote.status === FAILURE) {
				res.status(400).send({ error: removeUpvote.error })
			}
			else {
				res.status(204).send() 
				console.log(`Successfully removed upvote from song ${req.params.songId} in session ${req.params.sessionId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get all songs from a session queue. (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/sessions/:sessionId/songs', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Set the current song in a session queue.
	 * The user must be the host of the given session.
	 */
	app.post('/sessions/:sessionId/songs/current', async (req, res) => {
		try {
            const setCurr = await dequeueSongController(
				redisVerifyHostExists,
				redisDequeueSongFromSession,
                req.params.sessionId,
				req.account.accountId
            )
			if (setCurr.status === FAILURE) {
				res.status(400).send({ error: setCurr.error })
			}
			else {
				res.status(204).send() 
				console.log(`Successfully added song to queue for session ${req.params.sessionId}`);
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}