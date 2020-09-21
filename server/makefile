infra/up:
	docker-compose up -d

infra/down:
	docker-compose down

dev:
	make infra/up
	docker-compose run api sh

say_hello:
	echo "Hello World"