dev:
	docker compose up --build

build:
	docker compose build

migrate:
	docker compose run --rm app node db/migrate.js

test:
	npm test

logs:
	docker compose logs -f
