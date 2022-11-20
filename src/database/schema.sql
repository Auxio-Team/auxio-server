CREATE TABLE account (
	id bigserial PRIMARY KEY,
	username varchar(25) NOT NULL UNIQUE,
	pass varchar(320) NOT NULL,
	phone_number varchar(20) NOT NULL UNIQUE,
	preferred_streaming_platform varchar(20) NOT NULL
);

CREATE TABLE refresh_token (
	account_id bigint REFERENCES account(id) PRIMARY KEY,
	token varchar(320) NOT NULL
);