const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_SONG = 'INVALID_SONG';
const INVALID_ID = 'INVALID_ID';

const queueSuccess = () => ({
    status: SUCCESS
});

const queueError = (error) => ({
    status: FAILURE,
    error: error
});

module.exports = {
    SUCCESS,
    FAILURE,
    INVALID_ID,
    INVALID_SONG,
    queueSuccess,
    queueError
}