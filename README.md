# Start the server
Run the server using command: `node server.js`


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