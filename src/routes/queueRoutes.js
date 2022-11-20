// import redis functions
const {
    redisVerifySessionIdExists
} = require('../redis/sessionRedis')

const {
	redisAddSongToSession,
	redisDequeueSongFromSession,
	redisSetCurrentSongForSession,
	redisVerifySongInQueue,
	redisAddUpvote
} = require('../redis/queueRedis')

// import controller functions
const {
	addSongController,
	dequeueSongController,
	setCurrentSongController,
	addUpvoteController
} = require('../controllers/queueController')

// import models 
const {
    FAILURE,
} = require('../models/queueModels')

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
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Get all songs from a session queue. (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/sessions/:id/songs', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Get next song in a session queue.  (we might not need this? depends on how subscribing to redis works)
	 */
	app.get('/sessions/:id/songs/next', async (req, res) => {
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
	 * Set the up next song in a session queue.
	 * (only the host should be able to make this call)
	 */
	app.post('/sessions/:id/songs/next', async (req, res) => {
		try {
            const dequeueSong = await dequeueSongController(
                redisVerifySessionIdExists,
				redisDequeueSongFromSession,
                req.params.id
            )
			if (dequeueSong.status === FAILURE) {
				res.status(400).send({ error: dequeueSong.error })
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
	 * Set the current song in a session queue.
	 * (only the host should be able to make this call)
	 */
	app.post('/sessions/:id/songs/current', async (req, res) => {
		try {
            const setCurr = await setCurrentSongController(
                redisVerifySessionIdExists,
				redisSetCurrentSongForSession,
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