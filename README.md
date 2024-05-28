# Node Express Reservation system

### Main features:

- Allows to create events with seats (1-1000)
- Can reserve a seat for a given event
- Can cancel a reservation
- Can get a list of all events

## Getting started

Install `Docker` and `Docker Compose` which are used to maximise the convenience of development on local machine.

When both are installed, build the image as follow:

```sh
docker-compose build
```

Run the app:

```sh
docker-compose up
```

Go to:

```
 http://localhost:8080/api/health
```

If you see the following response in the browser:

```
{"status":"OK","data":"2022-02-13T20:05:13.965Z"}
```

It means that everything work as expected.
Please scroll down to "How to work" section.

## Getting started, standard way (no containerization)

If you want to run "standard dev way" using the `npm` instead of `docker-compose`.

Install dependencies:

```
npm install
```

Run server in dev mode:

```
npm run server:dev
```

Run the reservation system in dev mode:

```
npm run reservation:dev
```

## Testing

The Jest test suites are run by executing

```sh
npm test
```

To run tests directly insiide of the <Anyname> container:

```sh
docker-compose run web npm run test
```

## Code linting

Run code quality analysis using

```sh
npm run lint
```

or insde of the container

```sh
docker-compose run web npm run lint
```

## Fixing problems

Automatically fix linter's problems

```sh
npm run lint:fix
```

or insde of the container

```sh
docker-compose run web npm run lint:fix
```

## Logging

```javascript
import logger from '@core/utils/logger';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
logger.silly('message'); // level 6
```

In development mode, log messages of all severity levels will be printed to the console.
In production mode, only `info`, `warn`, and `error` logs will be printed to the console.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).


## SwaggerUI

An interactive API documentation of <Anyname> can be accessed at the path: <baseURL>/api-docs \
For local development use this: http://localhost:8080/api-docs \
If your webservice's basePath is different from `"/"` put basePath after `api-docs` in url address e.g. \
for service placed under `<basePath>` subfolder the correct URL is: `https://<baseURL>/<basePath>/api-docs/<basePath>` \
Remember to select correct protocol befor you try to call any endpoint, "http" is used only for local development. \
Important: swaggerUI is disabled for the production env

## Running in production with Docker

For the sake of readability, you may build an image with custom name go to the root project (where the Dockerfile is) and execute:

`docker build -t <anyname> .`

When done, execute the docker run command to create a container from <anyname> image and starts the container with all the required environment variables:

`docker run --rm -it -e NODE_ENV='production' -e API_KEY_TOKEN='token' -p 8080:8080 <anyname>`

That's it, you just ran the app in production mode.

