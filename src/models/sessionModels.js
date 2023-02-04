const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_ID = 'INVALID_ID';
const INVALID_NAME = 'INVALID_NAME';
const INVALID_HOST = 'INVALID_HOST';
const INVALID_CAPACITY = 'INVALID_CAPACITY';
const MAX_CAPACITY = 'MAX_CAPACITY';
const SESSION_HISTORY = 'SESSION_HISTORY';
const SESSION_PARTICIPANT = 'SESSION_PARTICIPANT';

const CODE_LENGTH = 6

const sessionSuccess = () => ({
    status: SUCCESS
});

const sessionError = (error) => ({
    status: FAILURE,
    error: error
});

module.exports = {
    SUCCESS,
    FAILURE,
    INVALID_ID,
    INVALID_NAME,
    INVALID_HOST,
    INVALID_CAPACITY,
    MAX_CAPACITY,
    SESSION_HISTORY,
    SESSION_PARTICIPANT,
    CODE_LENGTH,
    sessionSuccess,
    sessionError
}