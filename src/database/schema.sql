CREATE TABLE account (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	pass VARCHAR(320) NOT NULL,
	phone_number VARCHAR(20) NOT NULL UNIQUE,
	preferred_streaming_platform VARCHAR(20) NOT NULL
);

CREATE TABLE refresh_token (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(50) NOT NULL,
	token VARCHAR(320) NOT NULL
);

CREATE TYPE friendship_status AS ENUM ('friends', 'requested')

CREATE TABLE friendship (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	account_1 BIGINT REFERENCES account(id),
	account_2 BIGINT REFERENCES account(id),
	current_status relationship_status NOT NULL,
	UNIQUE (account_1, account_2)
);