// import redis functions
const {
    redisVerifySessionIdExists
} = require('../redis/sessionRedis')

const {
	redisAddSongToSession,
	redisDequeueSongFromSession,
	redisVerifySongInQueue,
	redisAddUpvote,
	redisRemoveUpvote
} = require('../redis/queueRedis')

// import controller functions
const {
	addSongController,
	dequeueSongController,
	addUpvoteController,
	removeUpvoteController
} = require('../controllers/queueController')

// import models 
const {
    FAILURE,
} = require('../models/queueModels')

/*
 *	TODO: make sure user is in session before executing
 *	any of the queue requests
 */ 

module.exports = function (app) {
	/*
	 * Add song to a session queue.
	 * 
	 * body format:
	 * {
	 *    song: <str_song_id>
	 * }
	 */
	app.post('/sessions/:id/song', async (req, res) => {
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
	 * Add an upvote (increment priority) to a song in a session queue.
	 */
	app.post('/sessions/:id/songs/:song_id/upvote', async (req, res) => {
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
	app.delete('/sessions/:id/songs/:song_id/upvote', async (req, res) => {
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
	 * Get all songs from a session queue. (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/sessions/:id/songs', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Get current song in a session queue. (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/sessions/:id/songs/current', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Set the current song in a session queue.
	 * (only the host should be able to make this call)
	 */
	app.post('/sessions/:id/songs/current', async (req, res) => {
		try {
            const setCurr = await dequeueSongController(
                redisVerifySessionIdExists,
				redisDequeueSongFromSession,
                req.params.id
            )
			if (setCurr.status === FAILURE) {
				res.status(400).send({ error: setCurr.error })
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
}