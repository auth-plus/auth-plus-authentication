infra/up:
	docker-compose up -d

infra/down:
	docker-compose down -d

dev:
	make infra/up
	docker-compose exec api sh

say_hello:
	echo "Hello World"