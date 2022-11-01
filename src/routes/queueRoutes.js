// import redis functions
const {
    redisVerifySessionIdExists
} = require('../redis/sessionRedis')

const {
	redisAddSongToSession
} = require('../redis/queueRedis')

// import controller functions
const {
	addSongController
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
	 *    song: <int_song_id>
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
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Remove an upvote (decrement priority) to a song in a session queue.
	 */
	app.delete('/sessions/:id/songs/:song_id/upvote', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Get songs from a session queue.
	 */
	app.get('/sessions/:id/songs', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})

	/*
	 * Get next song in a session queue.
	 */
	app.get('/sessions/:id/songs/next', async (req, res) => {
		console.log('endpoint not yet implemented - sorry!')
		res.status(405).send("endpoint not yet implemented") 
	})
}