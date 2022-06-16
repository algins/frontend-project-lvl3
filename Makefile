install:
	npm ci

run:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npx playwright test
