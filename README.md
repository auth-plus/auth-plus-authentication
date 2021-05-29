# Auth+

## Pré-requisite

- Docker v20.10.6
- Docker Compose v1.28.4
- Node v14.17.0

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/schema.sql
make infra/down # does not remove volume

# sync migration
make database-sync

# developer and test enviroment
make dev


# clean
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove


```
