# Start the server
Run the server using command: `node server.js`


# Folder Structure
- routes/database/redis: rely on third-party dependency (as name suggest)
- controller: takes parameters and validates them
- services: controller validates the parameters using functions defined in services
- model: standardizes object structure used throughout
- configs


# Install PostgreSQL on Mac

Download Postgres app here: https://postgresapp.com/downloads.html. Download "Postgres.app with all currently supported versions (Universal/Intel)" which is under the "Additional Releases" section.

Add the path of the postgres bin directory to your PATH variable.

Open the Postgres application and start the server using newest version of Postgres (14.5).

Interact with databases by running "psql" from the command line.


# Install PostgreSQL on Windows (WSL)

These instructions are helpful if you want to try to install PostgreSQL on Windows without WSL: https://phoenixnap.com/kb/install-postgresql-windows

These are the steps I took to install PostgreSQL on WSL (a Linux subsystem for Windows):

- Install PostgreSQL: `sudo apt install postgresql-12`
- Start Postgres server: `sudo service postgresql start`
- Connect to postgres database as superuser: `sudo -u postgres psql`
- Enter following database commands to create your user:
  - `create user <USER> with encrypted password '<PGPASSWORD>';`
    - replace `<USER>` with output of `echo $USER`
    - replace `<PGPASSWORD>` with a password of your choice
  - `alter user <USER> createdb;`
  - `\q` to exit the database
- Set PGPASSWORD environment variable to the password of your choice from above: `export PGPASSWORD=<PGPASSWORD>`
- `echo $PGPASSWORD` should output your password now
- If using VSCode, reload terminal before running server

# Install Redis

- Use these instructions to install Redis on your machine: https://redis.io/docs/getting-started/
  - the redis docs are actually very useful and easy to read:) 
- Run `redis-server <path/to/conf>` to start the server
  - the config file is under `musix-server/src/configs/redis-36379.conf`
- Run `redis-cli -p 36379` to interact with the Redis server from the CLI

## Useful commands to see data in the Redis-cli
- `smembers sessions` - list all currently running session ids
- `smembers hosts` - list all users that are hosts
- `smembers session:<session id>:participants` - list all participants in the given session
- `hgetall session:<session id>` - get information about the given session

## TODO items with Redis
- TODO implement redis server start automatically with server
- TODO implement redis security
- TODO update redis config file
- TODO look at redis EVENT NOTIFICATION section of config file for event notifying (i'm thinking we use this for notifying client uis when queue order is updated)