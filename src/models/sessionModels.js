const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_ID = 'INVALID_ID';
const INVALID_NAME = 'INVALID_NAME';
const MAX_CAPACITY = 'MAX_CAPACITY';

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
    sessionSuccess,
    sessionError
}