docker volume rm aino_pg_data
sh dbstart.sh
node AINO-server/scripts/init-database.js