# Praise Scripts

Praise comes with a few bash scripts to simplify the management of a Praise installation.
Run scripts using:

```
bash [scriptname.sh]
```

## setup.sh

Builds and runs the Praise setup script. Run this script before starting Praise the first time.

## start.sh

Starts all Praise services.

## restart.sh

Restarts all Praise services. Run this command after changing the server settings.

## upgrade.sh

Downloads new server images and restarts Praise to perform the upgrade.

## database-backup.sh

Makes a full backup of the database. Backup is saved as a file in the current folder. Script uses login information in .env.

## database-restore.sh

**Usage:**

```
bash database-restore.sh [filename]
```

Deletes the currently active database and replaces it with data from the backup.

## reset.sh

Shuts down all running Praise services, deletes all containers and images.  
**Warning**: Use with caution. N.b. The server setting are not reset, all database passwords etc are left untouched.
