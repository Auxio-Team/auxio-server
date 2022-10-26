# Start the server
Run the server using command: `node server.js`

# Start the authentication server
Run the server using command: `node authServer.js`

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

## Useful commands to use in the Postgres CLI
- To use Postgres from command line run the command: `psql`
  - if working correctly, you will see something like this:

    `psql (14.5)`

    `Type "help" for help.`

    `<name>=#`
- To see the databases on your server, use the command: `\l`
- To switch to a database, use the command: `\c <name of database>`
- To see the list of relations in the database, use the command: `\d`
- To see the structure of a specific relation, use the command: `\d <name of relation>`
- To run a query on the database, use the following commands:
  - `\g`
  - `<the query you want to run> (Ex. "SELECT * from account")`
  - `\g`
- To stop the connection to the database, use the command: `\q`

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

## Redis song queue protocol

The song queue is a redis sorted set.  A sorted set has elements sorted by their priority.  The maximum priority allowed by redis is 2^53 and the minimum priority allowed by redis is -(2^53).  Redis also allows priorities of `+inf` and `-inf`.  This is the protocol we will follow for assigning priorities to songs in the queue:

- Every priority will be 7 integers long
- The 2 rightmost integers will be the number of upvotes a song has 
  - so if a song is newly added to the queue, the 2 rightmost integers will be `01` since the person that added the song cannot upvote their own song
  - 2 digits is sufficient for this since the max number of participants in a given session is 50, so the maximum number of upvotes a song could have is 50.
- The 5 leftmost integers will be the position in the queue for the given number of upvotes
  - so if two songs both have 5 upvotes, the one that reached 5 upvotes first would have the position `00001` and the one that reached the 5 upvotes second would have the position `00002`
  - 5 digits is sufficient for this since assuming a given session has maxed out at the 50 participants in the session, it would allow for each participant to queue more than 1000 songs each
    - for reference, Spotify has a maximum queue length of somewhere between 50 - 90 songs, so a queue with 50,000 songs is sufficiently large
    - also since the max priority of an element in redis is 2^53, this queue could theoretically support up to about that many
- Example:
  - Assume a queue has 5 songs
  - Assume 2 of the songs both have 2 upvotes and the other 3 have no upvotes
  - If a song S is added, its initial priority will be `0000401`
  - If that song S then receives 2 upvotes, its new priority will be `0000303`
  - If that song S receives a third upvote, its new priority will then be `0000104`

## TODO items with Redis
- TODO implement redis server start automatically with server
- TODO implement redis security
- TODO update redis config file
- TODO look at redis EVENT NOTIFICATION section of config file for event notifying (i'm thinking we use this for notifying client uis when queue order is updated)