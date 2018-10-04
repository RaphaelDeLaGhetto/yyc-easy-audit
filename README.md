yyc-easy-audit
==============

A simple proof-of-concept application of linear regression on residential property tax reports obtained from [assessmentsearch.calgary.ca](https://assessmentsearch.calgary.ca). This software helps visually identify possible outliers produced by the City of Calgary's Assessment _Service_.

# Approach

## Get the data

With no open API, there is currently only one way to obtain Calgary residential property tax data: [assessmentsearch.calgary.ca](https://assessmentsearch.calgary.ca). The City of Calgary does not allow limitless, easy access to the residential property data purchased by taxpayers. You can obtain 50 PDF reports at a time. Once you reach your limit, City labourers are usually pretty good about resetting, though sometimes you have to wait a couple of days.

Collect as many reports as you can and store them in a directory.

## Consolidate the data

As with data collection, there is currently only one way for a citizen to consolidate the data for analysis: [the proptax report-generator](https://github.com/TaxReformYYC/report-generator-2018). The current version of this software processes 2018 PDF residential property reports. The software is updated every year as the format and content of the PDF property reports changes.

### proptax

Install as [directed](https://github.com/TaxReformYYC/report-generator-2018).

Supposing all the PDF reports are stored in `~/2018-property-reports`, execute the following:

```
proptax consolidate ~/2018-property-reports > consolidated.csv
```

This will create a file called `consolidated.csv`, which will be imported into the `yyc-easy-audit` database.

## Import data

This assumes the `yyc-easy-audit` web application has been cloned and installed [see Setup below](#setup). You'll also need the `consolidated.csv` file produced by `proptax`.

From the application directory:

```
./bin/import.sh ../path/to/consolidated.csv
```

## GET address coordinates

This script inserts GPS coordinates into the database for the properties without. Provide a filename to save coordinates for later:

```
./bin/geoJsonImport.sh ../path/to/gps.json
```

### Import GPS coordinates from file

The output from the `geoJsonImport.sh` script can be saved to file and imported later with `loadSavedCoords.sh`: 

```
./bin/loadSavedCoords.sh ../path/to/gps.json
```

## Generate map marker data

This plots property info on the map:

```
./bin/makeMarkers.sh public/maps/markers.json
```

# Setup

## Testing

Clone and install dependencies:

```
npm install
cp .env.example .env
```

### For Docker fans

Start a MongoDB development server:

```
docker run --name dev-mongo -p 27017:27017 -d mongo
```

Once created, you can start and stop the container like this:

```
docker stop dev-mongo
docker start dev-mongo
```

### Execute

```
npm test
```

To execute a single test file, be sure to set the `NODE_ENV` variable:

```
NODE_ENV=test ./node_modules/.bin/jasmine spec/features/appSpec.js
```

## Development

Clone and install dependencies:

```
npm install
cp .env.example .env
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

## Production

Clone:

```
git clone 
```

Configure `.env`:

```
#
# Scripts can do address geocoding. Need access to Google Maps API for that
#
GEOCODE_API=yourMapsApiKey
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

### Seed

```
docker-compose -f docker-compose.prod.yml run --rm node node db/seed.js NODE_ENV=production
```


