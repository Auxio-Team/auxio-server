const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const INVALID_ID = 'INVALID_ID';
const INVALID_NAME = 'INVALID_NAME';

const joinSuccess = () => ({
    status: SUCCESS
});

const joinError = (error) => ({
    status: FAILURE,
    error: error
});

const leaveSuccess = () => ({
    status: SUCCESS
});

const leaveError = (error) => ({
    status: FAILURE,
    error: error
});

module.exports = {
    SUCCESS,
    FAILURE,
    INVALID_ID,
    INVALID_NAME,
    joinSuccess,
    joinError,
    leaveSuccess,
    leaveError
}