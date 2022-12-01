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

CREATE TYPE platform_type AS ENUM ('Apple Music', 'Spotify');

CREATE TABLE musix_session (
  id bigserial PRIMARY KEY,
  name varchar(25) NOT NULL,
  host_id bigint REFERENCES account(id),
  date varchar(10) NOT NULL,
  platform platform_type NOT NULL,
  track_ids text[],
);

CREATE TABLE musix_session_user (
  account_id bigint REFERENCES account(id),
  musix_session_id bigint REFERENCES musix_session(id),
  PRIMARY KEY(account_id, musix_session_id)
);

CREATE TYPE friendship_status AS ENUM ('friends', 'requested');

CREATE TABLE friendship (
	id bigserial NOT NULL PRIMARY KEY,
	requester_id bigint REFERENCES account(id),
	recipient_id bigint REFERENCES account(id),
	current_status friendship_status NOT NULL,
	UNIQUE (requester_id, recipient_id)
);