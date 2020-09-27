infra/up:
	docker-compose up -d

infra/down:
	docker-compose down

dev:
	make infra/up
	docker-compose exec api sh
	infra/down: