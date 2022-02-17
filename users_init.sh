#!/bin/bash
set -e

# MONGO_DB_USER is the userName used from applicatoin code to interact with databases and MONGO_DB_PASSWORD is the password for this user.
# MONGO_INITDB_ROOT_USERNAME & MONGO_INITDB_ROOT_PASSWORD is the config for db admin.
# admin user is expected to be already created when this script executes. We use it here to authenticate as admin to create
# MONGO_DB_USER and databases.

echo ">>>>>>> trying to create database and users"
if [ -n "${MONGO_INITDB_ROOT_USERNAME:-}" ] && [ -n "${MONGO_INITDB_ROOT_PASSWORD:-}" ] && [ -n "${MONGO_DB_USER:-}" ] && [ -n "${DB_PASSWORD:-}" ]; then
mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD<<EOF
use praise_db;
db.createUser({
  user:  '$MONGO_DB_USER',
  pwd: '$MONGO_DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'praise_db'
  }]
});
EOF
else
    echo "MONGO_INITDB_ROOT_USERNAME,MONGO_INITDB_ROOT_PASSWORD, MONGO_DB_USER and MONGO_DB_PASSWORD must be provided. Some of these are missing, hence exiting database and user creatioin"
    exit 403
fi