const { redisClient } = require('./initRedis');

/*
 * Check if the given song exists in the queue.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param songId -> the song id associated with the song for playback.
 * @return -> true if the song is in the queue, false otherwise
 */
const redisVerifySongInQueue = async (sessionId, songId) => {
    const resp = await redisClient.ZSCORE(
        `sessions:${sessionId}:queue`,
        songId
    )
    return resp !== null
}

/*
 * Add song to queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param songId -> the song id associated with the song for playback.
 * @return -> true if the session is created successfully
 */
const redisAddSongToSession = async (sessionId, songId) => {
    // calculate song priority for new song
    const count = await redisClient.ZCOUNT(
        `sessions:${sessionId}:queue`,
        0000001,
        9999901
    ).then((resp) => resp)
    .catch((err) => console.log('Error when counting number of songs in queue\n' + err))

    const prio = (01 * 100000) + (99999 - count)

    // add new song to queue
    const resp = await redisClient.sendCommand([
        'ZADD',
        `sessions:${sessionId}:queue`,
        'NX',
        `${prio}`,
        `${songId}`
    ]).then((resp) => resp == 1)
    .catch((err) => console.log(`Error when trying to add song to queue\n${err}`))

    // notify subscribers that a song was added to the queue
    if (resp) {
        await redisClient.sendCommand([
            'PUBLISH',
            `sessions:${sessionId}`,
            'queueUpdated'
        ])
        console.log("published")
    }

    return resp
}

module.exports = { 
    redisAddSongToSession,
    redisVerifySongInQueue
}