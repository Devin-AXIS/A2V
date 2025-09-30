docker stop postgres:16
docker rm postgres:16
docker volume rm aino_pg_data
node AINO-server/scripts/init-database.js