const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_ID = 'INVALID_ID';
const INVALID_NAME = 'INVALID_NAME';
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
    MAX_CAPACITY,
    SESSION_HISTORY,
    SESSION_PARTICIPANT,
    CODE_LENGTH,
    sessionSuccess,
    sessionError
}