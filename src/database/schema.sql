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
  id varchar(6) PRIMARY KEY,
  name varchar(25) NOT NULL,
  host_id bigint REFERENCES account(id),
  date varchar(10) NOT NULL,
  platform platform_type NOT NULL,
  track_ids text[],
  completed boolean NOT NULL
);

CREATE TABLE musix_session_user (
  account_id bigint REFERENCES account(id),
  musix_session_id varchar(6) REFERENCES musix_session(id),
  PRIMARY KEY(account_id, musix_session_id)
);