const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_ID = 'INVALID_ID';
const INVALID_NAME = 'INVALID_NAME';

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
    sessionSuccess,
    sessionError
}