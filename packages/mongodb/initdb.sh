#!/bin/bash
set -e

# Check if all needed variables are set, else exit
if [ -z "$MONGO_USERNAME" ] || [ -z "$MONGO_PASSWORD" ] || [ -z "$MONGO_INITDB_ROOT_USERNAME" ] || [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  echo "One or more of the required environment variables are not set. Exiting..."
  exit 1
fi 
  
sleep 10

# Make sure the MONGO_USERNAME is set up in the admin database and not in the praise_db database
# MONGO_USERNAME should have readWrite access to the praise_db database as well as the praise_db_testing_tmp database

mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD<<EOF

use praise_db;

if (db.getUser('$MONGO_USERNAME') !== null) {  
  db.runCommand({
    dropUser: '$MONGO_USERNAME',
  })
}

use admin;

if (db.getUser('$MONGO_USERNAME') === null) {  
  db.createUser({
    user:  '$MONGO_USERNAME',
    pwd: '$MONGO_PASSWORD',
    roles: [{
      role: 'readWrite',
      db: 'praise_db'
    }]
  });
}

db.getSiblingDB("admin").grantRolesToUser( "$MONGO_USERNAME", [ { role: "readWrite", db: "praise_db" } ] )
db.getSiblingDB("admin").grantRolesToUser( "$MONGO_USERNAME", [ { role: "readWrite", db: "praise_db_testing_tmp" } ] )

EOF