infra/up:
	docker-compose up -d database database-migration cache cache-ui prometheus grafana elasticsearch logstash kibana jaeger zookeeper kafka kafdrop

infra/down:
	docker-compose down

dev:
	make infra/up
	docker-compose up -d api
	docker-compose exec api sh

test/ci:
	make infra/up
	docker-compose up -d api
	docker-compose exec -T api npm ci
	docker-compose exec -T api npm test
	make clean/docker

clean/node:
	rm -rf node_modules
	rm package-lock.json

clean/docker:
	make infra/down
	docker container prune -f
	docker volume prune -f
	docker image prune -f
	docker network prune -f
	rm -rf db/schema.sql
	rm -f db/schema.sql

clean/test:
	sudo rm -rf coverage .nyc_output build