install:
	npm ci

start:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
