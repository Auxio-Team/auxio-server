const { redisClient } = require('./initRedis');

// Helper functions (not exported)
const redisCalculateScoreForSongEntry = async (sessionId, numUpvotes) => {
    const minPrio = numUpvotes * 100000
    const maxPrio = minPrio + 99999
    // calculate song priority for new song
    const count = await redisClient.ZCOUNT(
        `sessions:${sessionId}:queue`,
        minPrio,
        maxPrio
    ).then((resp) => resp)
    .catch((err) => console.log('Error when counting number of songs in queue\n' + err))

    const prio = maxPrio - count
    return prio
}

const redisShiftSongs = async (sessionId, minScore, maxScore) => {
    const songsList = await redisClient.sendCommand([
        'ZRANGE',
        `sessions:${sessionId}:queue`,
        `${minScore}`,
        `${maxScore}`,
        'BYSCORE'
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when getting queue by score\n${err}`))

    songsList.forEach(async id => {
        await redisClient.sendCommand([
            'ZINCRBY',
            `sessions:${sessionId}:queue`,
            `1`,
            `${id}`
        ]).then((resp) => resp)
        .catch((err) => console.log(`Error when incrementing priority\n${err}`))
    });

}

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
    // note: new songs always start with an upvote count of 1
    const prio = await redisCalculateScoreForSongEntry(sessionId, 1)

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

/*
 * Dequeue next song from queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @return -> true if the song was dequeued successfully
 */
const redisDequeueSongFromSession = async (sessionId) => {
    // dequeue the next up song
    const member = await redisClient.ZPOPMAX(
        `sessions:${sessionId}:queue`
    ).then((resp) => resp)
    .catch((err) => console.log('Error when dequeuing\n' + err))
    console.log(member)

    // shift the priorities of the other songs
    const minScore = member.score - 99999
    const maxScore = member.score
    redisShiftSongs(sessionId, minScore, maxScore)

    // update next up song
    await redisClient.sendCommand([
        'HSET',
        `sessions:${sessionId}`,
        'next',
        `${member.value}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when updating next song\n${err}`))

    // publish to subscribers
    console.log("publishing next updated")
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'nextUpdated'
    ])
    console.log("published")

    return true
}

/*
 * Set current song for queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @return -> true if the song was dequeued successfully
 */
const redisSetCurrentSongForSession = async (sessionId) => {
    // get next up song
    const songId = await redisClient.sendCommand([
        'HGET',
        `sessions:${sessionId}`,
        'next'
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when getting up next song\n${err}`))

    // set current song
    await redisClient.sendCommand([
        'HSET',
        `sessions:${sessionId}`,
        'curr',
        `${songId}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when setting current\n${err}`))

    // remove next up song assignment
    await redisClient.sendCommand([
        'HSET',
        `sessions:${sessionId}`,
        'next',
        ''
    ]).then((resp) => resp) 
    .catch((err) => console.log(`Error when removing up next\n${err}`))

    // publish current song
    console.log("publishing curr updated")
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'currentUpdated'
    ])
    console.log("published")

    // publish next up song
    console.log("publishing next updated")
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'nextUpdated'
    ])
    console.log("published")

    return true
}

const redisGetSessionQueue = async (sessionId) => {
    // get queue
    return await redisClient.sendCommand([
        'ZREVRANGE',
        `sessions:${sessionId}:queue`,
        '0',
        '-1'
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when getting queue\n${err}`))
}

/*
 * Upvote song in queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param songId -> the song id associated with the song for playback.
 * @return -> true if the session is created successfully, otherwise false
 */
const redisAddUpvote = async (sessionId, songId) => {
    // get current number of upvotes
    const currPrio = await redisClient.sendCommand([
        'ZMSCORE',
        `sessions:${sessionId}:queue`,
        `${songId}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when getting priority of song ${songId}\n${err}`))

    // get current number of upvotes before adding an upvote
    const currNumUpvotes = Math.trunc(currPrio / 100000)
    const newPrio = await redisCalculateScoreForSongEntry(sessionId, currNumUpvotes + 1)
    const incrby = newPrio - currPrio
    
    // increment song priority
    const resp = await redisClient.sendCommand([
        'ZINCRBY',
        `sessions:${sessionId}:queue`,
        `${incrby}`,
        `${songId}`
    ]).then((resp) => resp >= 0)
    .catch((err) => console.log(`Error when trying to increment priority of song ${songId}\n${err}`))

    // shift the priorities of the other songs
    const minScore = currNumUpvotes * 100000
    const maxScore = currPrio
    redisShiftSongs(sessionId, minScore, maxScore)

    return resp
}

module.exports = { 
    redisAddSongToSession,
    redisVerifySongInQueue,
    redisDequeueSongFromSession,
    redisSetCurrentSongForSession,
    redisGetSessionQueue,
    redisAddUpvote
}