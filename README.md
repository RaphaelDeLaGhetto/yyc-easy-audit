yyc-easy-audit
==============

A simple proof-of-concept application of linear regression on residential property tax reports obtained from [assessmentsearch.calgary.ca](https://assessmentsearch.calgary.ca). This software helps visually identify possible outliers produced by the City of Calgary's Assessment _Service_.

# Testing

## Setup

Clone and install dependencies:

```
npm install
```

## For Docker fans

Start a MongoDB development server:

```
docker run --name dev-mongo -p 27017:27017 -d mongo
```

Once created, you can start and stop the container like this:

```
docker stop dev-mongo
docker start dev-mongo
```

## Execute

```
npm test
```

To execute a single test file, be sure to set the `NODE_ENV` variable:

```
NODE_ENV=test ./node_modules/.bin/jasmine spec/features/appSpec.js
```

# Development

## Setup

Clone and install dependencies:

```
npm install
```

To start a Dockerized Mongo container, see above...

Seed database:

```
node db/seed.js
```

Run server:

```
npm start
```

# Production

Clone:

```
git clone 
```

In the application directory:

```
cd yyc-easy-audit
NODE_ENV=production npm install
```

The _Dockerized_ production is meant to be deployed behind an `nginx-proxy`/`lets-encrypt` combo. Update `LETSENCRYPT_EMAIL` in `docker-compose.prod.yml` and execute:

```
docker-compose -f docker-compose.prod.yml up -d
```

## Seed

```
docker-compose -f docker-compose.prod.yml run --rm node node db/seed.js NODE_ENV=production
```


