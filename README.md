# PM API

This code is just for demo - 

### REST API
- Our REST API is built in NodeJS using Express.
- The API is deployed to a Lambda function that is behind API Gateway.
- API Gateway uses a Cognito User Pool to authenticate the requests to the API.
- For our database we use MongoDB with a caching layer implemented with ElasticCache Redis.

#### Environment setup

1) Copy the environment config file and edit `.env` to match your needs.
```bash
$ cp .env.sample .env
```
2) Use the correct Node version with NVM. Node version is set in `.nvmrc`.
```bash
$ nvm install
```
3) Install dependencies.
```bash
$ npm install
```
4) Start the server with Docker.
```bash
$ npm run start:docker
```

#### Test

1) Lint the code.
```bash
$ npm run lint
```
2) Run the tests.
```bash
$ npm run test:docker
```

#### Migrations

**NOTE**: To run commands inside docker you can add `:docker` at the end of each npm script.
Example: `npm run migrate:status:docker`

1) Check migrations status.
```bash
$ npm run migrate:status
```
2) Run migrations.
```bash
$ npm run migrate:up
```
3) Rollback a migration.
```bash
$ npm run migrate:down
```
