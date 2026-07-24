.PHONY: infra/up
infra/up:
	docker compose up -d
	HOST=localhost make migration/up

.PHONY: infra/down
infra/down:
	docker compose down -v

.PHONY: reset
reset:
	docker compose down -v
	docker compose up -d
	HOST=localhost make migration/up

.PHONY: start
start:
	docker compose exec -it api npm run build
	docker compose exec -it api npm start

.PHONY: dev
dev:
	make infra/up
	docker compose exec -it api sh

.PHONY: ci
ci:
	npm run lint:check
	npm run build:check
	npm test

.PHONY: test/mutation
test/mutation:
	make infra/up
	docker compose exec -it api npm ci
	docker compose exec -it api npm run stryker
	make clean/docker

.PHONY: test/load
test/load:
	make start
	docker run --rm -i grafana/k6 run - <test/loading/k6.js


.PHONY: clean/node
clean/node:
	rm -rf node_modules
	rm package-lock.json

.PHONY: clean/test
clean/test:
	sudo rm -rf coverage build

.PHONY: migration/up
migration/up:
	docker run -t --network=host -v "$(shell pwd)/db:/db" ghcr.io/amacneil/dbmate:1.16 --url postgres://root:db_password@$(HOST):5432/auth?sslmode=disable --wait --wait-timeout 60s --no-dump-schema up