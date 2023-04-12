# Development Docs

### Manually Backup and Restore Database

Replace DB_ROOT_USER, DB_ROOT_PASSWORD, and BACKUP_DATE in the following commands:

**Backup**
docker exec -i mongodb-praise /usr/bin/mongodump --authenticationDatabase admin --archive -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db $MONGO_DB > database-backup-$(date -I).archive

**Restore**

```
docker exec -i mongodb-praise sh -c "mongorestore --authenticationDatabase admin -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db $MONGO_DB --archive" < database-backup-BACKUP_DATE.archive
```

### Connect to mongodb database running on docker

```
docker exec -it mongodb-praise sh -c "mongosh  \"mongodb://DB_USER:DB_PASSWORD@127.0.0.1:27017/DB_NAME\""
```

### Run Api Tests

```
docker exec -it api-praise yarn workspace api test
```
