
/*
 * Verify that the username exists and that the password matches (use Bcrypt to compare passwords)
 * @param username -> the username that was entered.
 * @param password -> the password that was entered.
 * @return -> true if the username/password matches a valid account, otherwise false.
 */
const verifyUsernamePassword = async (dbGetPasswordByUsername, username, password) => {
	const accountPassword = await dbGetPasswordByUsername(username)
	if (acountPassword == null || !await bcrypt.compare(password, accountPassword)) {
		return false
	}
	else {
		return true
	}
}