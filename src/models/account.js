const account = (username, password, phoneNumber) => {
	const account = {
		username: username,
		password: password,
		phoneNumber: phoneNumber
	}	
	return account
}

module.exports = {
	account
}