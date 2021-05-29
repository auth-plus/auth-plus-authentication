include .env

infra/up:
	docker-compose up -d database

infra/down:
	docker-compose down

database-sync:
	docker run --rm -it --network=host -v "$(shell pwd)/db:/db" amacneil/dbmate \
		--url $(DATABASE_URL) \
		--wait \
		--wait-timeout $(DBMATE_WAIT_TIMEOUT) \
		up
dev:
	make infra/up
	docker-compose up -d api
	docker-compose exec api sh

clean/node:
	rm -rf node_modules
	rm package-lock.json

clean/docker:
	make infra/down
	docker container prune
	docker volume prune
	docker image prune