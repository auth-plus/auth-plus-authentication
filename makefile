.PHONY: infra/up
infra/up:
	docker compose up -d
	HOST=localhost make migration/up

.PHONY: infra/down
infra/down:
	docker compose down

.PHONY: dev
dev:
	make infra/up
	docker compose exec api sh

.PHONY: start
start:
	make infra/up
	docker compose exec -T api npm ci
	docker compose exec -T api npm run build
	docker compose exec -d api npm start

.PHONY: ci
ci:
	npm run lint:check
	npm run format:check
	npm run build:check
	npm test

.PHONY: test/mutation
test/mutation:
	make infra/up
	docker compose exec -T api npm ci
	docker compose exec -T api npm run stryker
	make clean/docker

.PHONY: test/load
test/load:
	make start
	docker run --rm -i grafana/k6 run - <test/loading/k6.js


.PHONY: clean/node
clean/node:
	rm -rf node_modules
	rm package-lock.json

.PHONY: clean/docker
clean/docker:
	make infra/down
	docker container prune -f
	docker volume prune -f
	docker image prune -f
	docker network prune -f
	rm -rf db/schema.sql
	rm -f db/schema.sql

.PHONY: clean/test
clean/test:
	sudo rm -rf coverage build

.PHONY: migration/up
migration/up:
	docker run -t --network=host -v "$(shell pwd)/db:/db" ghcr.io/amacneil/dbmate:1.16 --url postgres://root:db_password@$(HOST):5432/auth?sslmode=disable --wait --wait-timeout 60s --no-dump-schema up