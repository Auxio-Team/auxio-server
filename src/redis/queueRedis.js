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

const redisShiftSongs = async (sessionId, minScore, maxScore, shiftNum = 1) => {
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
            `${shiftNum}`,
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
 * @return -> true if the song was added to the session successfully
 */
const redisAddSongToSession = async (sessionId, songId) => {
    // calculate song priority for new song
    // note: new songs always start with an upvote count of 0
    const prio = await redisCalculateScoreForSongEntry(sessionId, 0)

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
            'songAdded'
        ])
        console.log("published song enqueued")
    }

    return resp
}

/*
 * Remove song from queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param songId -> the song id associated with the song for playback.
 * @return -> true if the song was removed successfully
 */
const redisRemoveSong = async (sessionId, songId) => {
    // get priority of song being removed
    const prio = await redisClient.sendCommand([
        'ZSCORE',
        `sessions:${sessionId}:queue`,
        `${songId}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when trying to get priority of song\n${err}`))

    // remove song from queue
    const resp = await redisClient.sendCommand([
        'ZREM',
        `sessions:${sessionId}:queue`,
        `${songId}`
    ]).then((resp) => resp == 1)
    .catch((err) => console.log(`Error when trying to remove song from queue\n${err}`))

    if (resp) {
        // shift the priorities of the other songs
        const minScore = Math.trunc(prio / 100000) * 100000
        const maxScore = prio
        redisShiftSongs(sessionId, minScore, maxScore)

        // notify subscribers that a song was removed
        await redisClient.sendCommand([
            'PUBLISH',
            `sessions:${sessionId}`,
            'songRemoved'
        ])
        console.log("published song removed")
    }

    return resp
}

/*
 * Dequeue new current song from queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @return -> true if the song was dequeued successfully
 */
const redisDequeueSongFromSession = async (sessionId) => {
    // dequeue the next up song
    var member = await redisClient.ZPOPMAX(
        `sessions:${sessionId}:queue`
    ).then((resp) => resp)
    .catch((err) => console.log('Error when dequeuing\n' + err))
    console.log(member)

    if (member === null) {
        member = ""
    } else {
        // shift the priorities of the other songs
        const minScore = member.score - 99999
        const maxScore = member.score
        redisShiftSongs(sessionId, minScore, maxScore)
    }

    // update current song
    await redisClient.sendCommand([
        'HSET',
        `sessions:${sessionId}`,
        'curr',
        `${member.value}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when updating current song\n${err}`))

    // publish to subscribers
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'currentUpdated'
    ])
    console.log("published next updated")

    return true
}

const redisGetCurrentSong = async (sessionId) => {
    return await redisClient.HGET(`sessions:${sessionId}`, 'curr')
        .then((resp) => {
            return resp
        })
        .catch((err) => console.log(`Error when getting current song\n${err}`))
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

    // publish upvote
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'upvoteAdded'
    ])
    console.log("published upvote added")

    return resp
}

/*
 * Remove upvotesong in queue for given session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param songId -> the song id associated with the song for playback.
 * @return -> true if the upvote is removed successfully, otherwise false
 */
const redisRemoveUpvote = async (sessionId, songId) => {
    // get current number of upvotes
    const currPrio = await redisClient.sendCommand([
        'ZMSCORE',
        `sessions:${sessionId}:queue`,
        `${songId}`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when getting priority of song ${songId}\n${err}`))

    // get current number of upvotes before adding an upvote
    const currNumUpvotes = Math.trunc(currPrio / 100000)
    const newPrio = (currNumUpvotes - 1) * 100000 + 99999
    const newNumUpvotes = Math.trunc(newPrio / 100000)
    const incrby = newPrio - currPrio

    // shift the priorities of the other songs down
    let minScore = newNumUpvotes * 100000
    let maxScore = newPrio
    await redisShiftSongs(sessionId, minScore, maxScore, shiftNum = -1)
    
    // increment song priority
    const resp = await redisClient.sendCommand([
        'ZINCRBY',
        `sessions:${sessionId}:queue`,
        `${incrby}`,
        `${songId}`
    ]).then((resp) => resp >= 0)
    .catch((err) => console.log(`Error when trying to increment priority of song ${songId}\n${err}`))

    // shift the priorities of the other songs up
    minScore = currNumUpvotes * 100000
    maxScore = currPrio
    redisShiftSongs(sessionId, minScore, maxScore)

    // publish upvote removed
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'upvoteRemoved'
    ])
    console.log("published upvote removed")

    return resp
}

module.exports = { 
    redisAddSongToSession,
    redisVerifySongInQueue,
    redisDequeueSongFromSession,
    redisGetCurrentSong,
    redisGetSessionQueue,
    redisAddUpvote,
    redisRemoveUpvote,
    redisRemoveSong
}