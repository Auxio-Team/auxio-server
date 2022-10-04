CREATE TABLE account (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	pass VARCHAR(320) NOT NULL,
	phone_number VARCHAR(20) NOT NULL UNIQUE,
	preferred_streaming_platform VARCHAR(10),
	dark_mode_enabled BOOLEAN NOT NULL);

CREATE TABLE refresh_token (
	token VARCHAR(64) NOT NULL);