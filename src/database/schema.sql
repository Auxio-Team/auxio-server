CREATE TABLE account (
	id bigserial PRIMARY KEY,
	username varchar(25) NOT NULL UNIQUE,
	pass varchar(320) NOT NULL,
	phone_number varchar(20) NOT NULL UNIQUE,
	preferred_streaming_platform varchar(20) NOT NULL
);

CREATE TABLE refresh_token (
	id bigserial PRIMARY KEY,
	username varchar(25) NOT NULL,
	token varchar(320) NOT NULL
);