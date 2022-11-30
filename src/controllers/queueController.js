const {
    INVALID_ID,
    INVALID_SONG,
    FAILURE,
    queueSuccess,
    queueError
} = require('../models/queueModels')

/*
 * Add a song to the queue for the given session.
 */
const addSongController = async ( redisVerifySessionIdExistsCb, redisAddSongToSessionCb, sessionId, songId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error adding song to queue: Session ID not valid')
        return queueError(INVALID_ID);
    }

    return await redisAddSongToSessionCb(sessionId, songId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            else if (res == false) {
                console.log('Error adding song to queue: song already in queue')
                return queueError(INVALID_SONG);
            }
            return queueError(FAILURE);
        });
}

/*
 * Pop the next song from the queue and 
 * set it to the current song.
 */
const dequeueSongController = async ( redisVerifySessionIdExistsCb, redisDequeueSongFromSessionCb, sessionId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error adding song to queue: Session ID not valid')
        return queueError(INVALID_ID);
    }

    return await redisDequeueSongFromSessionCb(sessionId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            return queueError(FAILURE);
        });
}

/*
 * Get the queue.
 */
const getSessionQueueController = async ( redisVerifySessionIdExistsCb, redisGetSessionQueueCb, sessionId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error getting queue: Session ID not valid')
        return queueError(INVALID_ID);
    }

    return await redisGetSessionQueueCb(sessionId)
        .then((res) => {
            console.log("QUEUE:")
            console.log(res)
            return res
        });
}

/*
 * Upvote song in the queue.
 */
const addUpvoteController = async ( redisVerifySessionIdExistsCb, redisVerifySongInQueueCb, redisAddUpvoteCb, sessionId, songId ) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error adding upvote: Session ID not valid')
        return queueError(INVALID_ID);
    }
    if (!await redisVerifySongInQueueCb(sessionId, songId)) {
        console.log('Error adding upvote: Song ID not valid')
        return queueError(INVALID_SONG);
    }

    return await redisAddUpvoteCb(sessionId, songId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            return queueError(FAILURE);
        });
}

/*
 * Remove upvote from song in the queue.
 */
const removeUpvoteController = async ( redisVerifySessionIdExistsCb, redisVerifySongInQueueCb, redisRemoveUpvoteCb, sessionId, songId ) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error removing upvote: Session ID not valid')
        return queueError(INVALID_ID);
    }
    if (!await redisVerifySongInQueueCb(sessionId, songId)) {
        console.log('Error removing upvote: Song ID not valid')
        return queueError(INVALID_SONG);
    }

    return await redisRemoveUpvoteCb(sessionId, songId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            return queueError(FAILURE);
        });
}

module.exports = { 
    addSongController,
    dequeueSongController,
    getSessionQueueController,
    addUpvoteController,
    removeUpvoteController
}