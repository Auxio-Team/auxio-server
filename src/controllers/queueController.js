const {
    INVALID_ID,
    INVALID_SONG,
    INVALID_USER,
    FAILURE,
    queueSuccess,
    queueError
} = require('../models/queueModels')

const validateSongReqController = async (redisVerifySongInQueueCb, sessionId, songId) => {
    if (!await redisVerifySongInQueueCb(sessionId, songId)) {
        console.log('Error removing song: Song ID not valid')
        return queueError(INVALID_SONG)
    }

    return queueSuccess()
}

/*
 * Add a song to the queue for the given session.
 */
const addSongController = async ( redisAddSongToSessionCb, sessionId, songId) => {
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
 * Remove song from the queue.
 */
const removeSongController = async ( redisRemoveSongCb, sessionId, songId ) => {
    return await redisRemoveSongCb(sessionId, songId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            return queueError(FAILURE);
        });
}

/*
 * Pop the next song from the queue and 
 * set it to the current song.
 */
const dequeueSongController = async ( redisVerifyHostExistsCb, redisDequeueSongFromSessionCb, sessionId, accountId) => {
    if (!await redisVerifyHostExistsCb(sessionId, accountId)) {
        console.log('Error ending session: User is not host')
        return queueError(INVALID_USER)
    }

    return await redisDequeueSongFromSessionCb(sessionId)
        .then((res) => {
            if (res) {
                return queueSuccess();
            }
            return queueError(FAILURE);
        });
}

const getCurrentSongController = async( redisVerifySessionIdExistsCb, redisGetCurrentSongCb, sessionId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error getting current song: Session ID not valid')
        return queueError(INVALID_ID);
    }

    return await redisGetCurrentSongCb(sessionId)
        .then((res) => {
            if (res) {
                return res;
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
const addUpvoteController = async ( redisAddUpvoteCb, sessionId, songId ) => {
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
const removeUpvoteController = async ( redisRemoveUpvoteCb, sessionId, songId ) => {
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
    getCurrentSongController,
    getSessionQueueController,
    addUpvoteController,
    removeUpvoteController,
    removeSongController,
    validateSongReqController
}