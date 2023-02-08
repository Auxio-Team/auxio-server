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
- `echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp`

Open the Postgres application and start the server using newest version of Postgres (14.5).

Interact with databases by running "psql" from the command line.


# Install PostgreSQL on Windows (WSL)

These instructions are helpful if you want to try to install PostgreSQL on Windows without WSL: https://phoenixnap.com/kb/install-postgresql-windows

These are the steps I took to install PostgreSQL on WSL (a Linux subsystem for Windows):

- Install PostgreSQL: `sudo apt install postgresql-12`
- Start Postgres server: `sudo service postgresql start`
- Connect to postgres database as superuser: `sudo -u postgres psql`
- Enter following database commands to create your user:
  - `create user <USER> with encrypted password '<PGPASSWORD>'`
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
  - the config file is under `auxio-server/src/configs/redis-36379.conf`
- Run `redis-cli -p 36379` to interact with the Redis server from the CLI

## Useful Redis Information
- Diagram displaying Redis relationships here: https://drive.google.com/file/d/1f8xqUTAgAZyrt_5qp2SkEBfgWaCWjwNA/view?usp=sharing
- Useful commands to see the data using Redis-cli:
  - `smembers hosts` - list all users that are hosts (List of Hosts table in diagram)
  - `smembers sessions` - list all currently running session ids (List of Session IDs table in diagram)
  - `hgetall sessions:<session id>` - get information about the given session (Session Info table in diagram)
  - `smembers sessions:<session id>:participants` - list all participants in the given session (List of Participants table in diagram)
  - `zrevrange sessions:<session id>:queue 0 -1` - list all songs in order in the queue of the given session (Queue of Songs table in diagram) (add `WITHSCORES` to the end of the command to see the priorities of the songs as well)
- all redis commands listed here: https://redis.io/commands/
- description of redis node package: https://www.npmjs.com/package/redis

## Redis song queue protocol

The song queue is a redis sorted set.  A sorted set has elements sorted by their priority.  The maximum priority allowed by redis is 2^53 and the minimum priority allowed by redis is -(2^53).  Redis also allows priorities of `+inf` and `-inf`.  This is the protocol we will follow for assigning priorities to songs in the queue:

- Every priority will be 7 integers long
- The 2 leftmost integers will be the number of upvotes a song has 
  - so if a song is newly added to the queue, the 2 leftmost integers will be `00`   
- The 5 rightmost integers will be the position in the queue for the given number of upvotes
  - so if two songs both have 5 upvotes, the one that reached 5 upvotes first would have the position `99999` and the one that reached the 5 upvotes second would have the position `99998`
  - 5 digits is sufficient for this since assuming a given session has maxed out at the 50 participants in the session, it would allow for each participant to queue more than 1000 songs each
    - for reference, Spotify has a maximum queue length of somewhere between 50 - 90 songs, so a queue with 50,000 songs is sufficiently large
    - also since the max priority of an element in redis is 2^53, this queue could theoretically support up to about that many
- Example:
  - Assume a queue has 5 songs
  - Assume 2 of the songs both have 2 upvotes and the other 3 have no upvotes
  - If a song S is added, its initial priority will be `0099996`
  - If that song S then receives 2 upvotes, its new priority will be `0299997`
  - If that song S receives a third upvote, its new priority will be `0399999`

# Docker Setup
these docs explain how to setup docker for a NodeJS application
- https://docs.docker.com/language/nodejs/

follow the next steps to get the containers up and running:
- download docker desktop
  - ... yes, i'm a big command line person myself but this docker desktop is actually pretty useful
  - https://docs.docker.com/get-docker/
  - there is also a docker vscode extension that you can install that is similar to the docker desktop

- build the docker images, create and run the containers from the compose file
  - from this directory (the root directory of the auxio-server repo) run this command: `docker compose up --build`
  - if you want the containers to just run in the background, append the `-d` flag to the end of the above command
- when you are ready to stop running the containers, run: `docker compose stop`
- `docker compose` commands doc: https://docs.docker.com/compose/reference/
- I also found the compose file specifications helpful when creating the compose file: https://docs.docker.com/compose/compose-file/

that's it! you should see all the containers up and running in your docker desktop inside an `auxio` project

if you would like to see the manual commands that the compose file is automating, below it explains how to run those for the auxio network, postgres db, redis server and auxio server:
### Auxio Network
- create the auxio-network
  - `docker network create auxio-network`
  - this is a user-defined network that'll allow our auxio containers to connect with each other
### Auxio Postgresql DB
- run the postgresql db in docker on the auxio network
  - `docker run -d --network auxio-network -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=pass postgres`
### Auxio Redis Server
- the following commands should be run from the root dir of the project (the `auxio-server` dir)
- build the redis-server image
  - `docker build --tag auxio-redis-server-img ./redis-server`
- you can see the images you just built: `docker images`
- to remove any images not currently being used in a container: `docker image prune -a`
- create and run the redis-server container
  - `docker run --rm -d --network auxio-network -p 36379:36379 --name auxio-redis-server auxio-redis-server-img`
- to stop the redis-server: `docker stop auxio-redis-server`
### Auxio Server
- the following commands should be run from the root dir of the project (the `auxio-server` dir)
- build the server image
  - `docker build --tag auxio-server-img .`
- create and run the auxio-server container
  - `docker run --rm -d -v /$HOME/.aws/credentials:/root/.aws/credentials:ro --network auxio-network -p 3000:3000 --name auxio-server auxio-server-img`
    - let's disect what this command is really doing:
    - `docker run` - this creates and runs a new docker container
    - `--rm` - this means that when the container stops running, it will also be removed completely.  if we omit this then the container will persist and will simply be in a stopped state when it stops running.  this could be useful if we want to maintain the state/variables in the container
    - `-d` - this runs the container in the background.  if we omit this then the terminal used to run it will be tied to the running container and you can see the console output there
    - `-v /$HOME/.aws/credentials:/root/.aws/credentials:ro` - this mounts the aws credentials file to the docker container in the aws shared credentials expected location as a read-only file
    - `--network auxio-network` - this puts the container on our auxio-network that we created earlier
    - `-p 3000:3000` - this publishes the 3000 port to the host and exposes the 3000 port from the docker container which we are running the server on
    - `--name auxio-server` - this names the container to auxio-server
    - `auxio-server-img` - this is the image we are running in the container
    - pretty straightforward! here's the docs for all the options when running the `docker run` command:
      - https://docs.docker.com/engine/reference/commandline/run/
- to stop the auxio-server: `docker stop auxio-server`
### Auxio Auth Server
The explanation for running the auth server in docker is in the README in the auxio-auth-server repo

you should see the containers running in the docker desktop now, and can also see it by running `docker ps`
- you can see the list of all containers running on the network by running `docker network inspect auxio-network`
- setup documentation followed here:
  - https://docs.docker.com/language/nodejs/

### Notes about how to connect services running locally on the host machine to connect to docker containers
To run postgres locally on your machine and allow connection to server running in docker:
- first, update postgres config to be accesable from other hosts
  - open your `postgresql.conf` file
  - there should be a comment that says `# comma-separated list of addresses;` in the file.  To the left of this comment, add this: `listen_addresses = '*'`
  - now open your `pg_hba.conf` file
  - at the bottom of the file under the `# IPv4 local connections:` comment, add these two lines:
    - `host all all 0.0.0.0/0 trust`
    - `host all all 172.18.0.0/16 trust`
- restart your local postgres database
- https://tecadmin.net/postgresql-allow-remote-connections/#:~:text=All%20you've%20to%20do,spaces%20between%20each%20IP%20address.

To run the server locally on your machine:
- to connect to postgres running on docker:
  - in the createClientPool.js file, make `PGHOST="localhost"`
- to connect to redis server running on docker:
  - in the `initRedis.js` file, change the `createClient` function to have `host: "localhost"`

I have not tried running the redis server locally with the other services running on docker, but I don't really see why this would happen anyway...
running the redis-cli locally does still work though with the redis-server on docker
