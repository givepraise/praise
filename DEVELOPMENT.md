# Development Docs

### Manually Backup and Restore Database

**Backup**
docker exec -i mongodb-praise /usr/bin/mongodump --authenticationDatabase admin --archive -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db praise_db > database-backup-$(date -I).db


**Restore**
```
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin -u DB_ROOT_USER -p DB_ROOT_PASSWORD --db praise_db --archive' < database-backup-$(date -I).db
```