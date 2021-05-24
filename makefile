infra/up:
	docker-compose up -d
	docker exec -it tournament-gateway_api_1 /bin/sh

infra/down:
	docker-compose down

dev:
	make infra/up
	docker-compose exec api sh
	infra/down: