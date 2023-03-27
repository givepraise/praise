#!/bin/bash

# intitdb.sh is run on every startup 
source /docker-entrypoint-initdb.d/initdb.sh &

# Start the mongod server
source docker-entrypoint.sh "mongod"
