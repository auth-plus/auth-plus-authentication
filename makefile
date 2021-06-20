include .env

infra/up:
	docker-compose up -d database cache

infra/down:
	docker-compose down

database-sync:
	rm ./db/schema.sql -f
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
	docker container prune -f
	docker volume prune -f
	docker image prune -f
	rm db/schema.sql