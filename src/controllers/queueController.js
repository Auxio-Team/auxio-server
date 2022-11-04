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
 * Pop the next song from the queue and add it to up next.
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
 * Set the current song to the queue.
 */
const setCurrentSongController = async ( redisVerifySessionIdExistsCb, redisSetCurrentSongForSessionCb, sessionId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error adding song to queue: Session ID not valid')
        return queueError(INVALID_ID);
    }

    return await redisSetCurrentSongForSessionCb(sessionId)
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
    setCurrentSongController
}