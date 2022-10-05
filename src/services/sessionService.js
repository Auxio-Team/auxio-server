var random = require('random-string-alphanumeric-generator');

/*
 * Generate a random session id for the newly created session
 * @param redisVerifySessionIdCb -> redis function to make sure generated id doesn't already exist
 * @return -> session id of new session
 */
const generateSessionId = async (redisVerifySessionIdExistsCb) => {
    var sessionid = random.randomAlphanumeric(6, "uppercase");
    while (await redisVerifySessionIdExistsCb(sessionid)) {
        sessionid = random.randomAlphanumeric(6, "uppercase");
    }
	return sessionid;
}

module.exports = { generateSessionId }