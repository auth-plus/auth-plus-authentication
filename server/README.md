# Back End

## Pré requisitos para desenvolvimento

- DOCKER:
```bash
docker run --name DB -p 3306:3306 -e MYSQL_ROOT_PASSWORD=302857CFC2A516528B44BD253F522282 -d mariadb:10.4
```

- DBMATE:
```bash
sudo curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/download/v1.7.0/dbmate-linux-amd64

sudo chmod +x /usr/local/bin/dbmate

dbmate up
```