Personal build notes
====================

This is largely driven by how I acquire the data.


Download new reports into directory:

```
mkdir report-batch-x
cd report-batch-x
```

# Data consolidation

## Single report directory

Consolidate report data:

```
proptax consolidate . > 2018-10-31-consolidated.csv
```

## Multiple report directories

From the base directory:

```
mkdir consolidated
for X in */; do proptax consolidate "$X" > "consolidated/${X%/}.csv"; done
rm consolidated/consolidated.csv
tar -czvf consolidated-data.tar.gz consolidated 
```

# Database import

Transfer the file to wherever `yyc-easy-audit` is storing CSV data:

```
scp consolidated-data.tar.gz daniel@wherever.ca:workspace/yyc-easy-audit/data/
```

## Import single file

Import that data

```
./bin/import.sh data/2018-10-31-consolidated.csv
```

Get GPS coordinates and load into database:

```
./bin/geoJsonImport.sh data/2018-10-31-gps.json
./bin/loadSavedCoords.sh data/2018-10-31-gps.json
```

## Import directory of files

Put data wherever appropriate:

```
tar -xzvf consolidated-data.tar.gz
```

From `yyc-easy-audit` project directory:

```
for X in data/consolidated/*; do ./bin/import.sh "$X"; done
```

Get GPS coordinates and load into database:

```
./bin/geoJsonImport.sh data/gps.json
./bin/loadSavedCoords.sh data/gps.json
```

# Make neighbours

Make neighbours between properties with wonky addresses:

```
./bin/makeNeighbours.sh "13 ROCKYSPRING WY NW" desc "21 ROCKYSPRING WY NW"
./bin/makeNeighbours.sh "5 ROCKYSPRING WY NW" desc "13 ROCKYSPRING WY NW"
```

Generate marker data (this needs to go wherever the static site is deployed):

```
./bin/makeMarkers.sh public/maps/markers.json
```

# Dump CSV data from DB

Get consolidated report CSV from database:

```
./bin/getReportData.sh public/report/
tar -czvf report-data.tar.gz public/report
```

Report generation needs to take place on an Ubuntu Desktop machine:

```
scp daniel@wherever.ca:workspace/yyc-easy-audit/report-data.tar.gz .
tar -xzvf report-data.tar.gz
cd public/report-data/
for X in *.csv; do cp "$X" consolidated.csv && proptax reports .; done
```


