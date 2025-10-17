# Databases

## Overview

MapServer can connect to most geospatial databases. There are native MapServer drivers for [PostgreSQL/PostGIS](https://mapserver.org/input/vector/postgis.html),
[Oracle](https://mapserver.org/input/vector/oracle.html), and [Microsoft SQL Server](https://mapserver.org/input/vector/mssql.html). Other databases
can be accessed through OGR, for example [MySQL](https://mapserver.org/input/vector/mysql.html).

In this exercise we'll be connecting to a PostGIS database to display water polygon features using a MapServer WMS. [PostGIS](https://postgis.net/) spatially enables the [PostgreSQL](https://www.postgresql.org/)
databases. 

## Docker Setup

To avoid having to install and setup a database we'll be using the [PostGIS Docker image](https://hub.docker.com/r/kartoza/postgis/) provided
by [Kartoza](https://kartoza.com/).

!!! info

    We will use a different Docker Compose file, which includes a PostGIS container for this exercise. We can stop the current Docker containers, and run the alternate Docker containers with the following commands:

    ```bash
    cd ./getting-started-with-mapserver/workshop/exercises
    docker compose down
    docker compose -f docker-db-compose.yml up -d
    # when finished
    docker compose -f docker-db-compose.yml down
    ```


## Checking the Database Connection with QGIS

If you have QGIS installed on your machine you can check you can successfully connect to the database by opening the
[browser panel](https://docs.qgis.org/3.34/en/docs/user_manual/managing_data_source/opening_data.html#the-browser-panel), and
creating a new PostgreSQL connection:

<figure markdown="span">
  ![image showing the QGIS browser](../assets/images/postgis-qgis-browser.png)
  <figcaption>The QGIS Browser Panel</figcaption>
</figure>

<figure markdown="span">
  ![image showing successful connection to a postgis database using QGIS](../assets/images/postgis-qgis-connection.png){ width="320" }
  <figcaption>Connecting to the Database with QGIS</figcaption>
</figure>

!!! tip

    - When connecting to the database from another Docker container port `5432` is used, and the host name is `db`
      as defined in the `docker-compose.yml` file.

    - When connecting from your own machine port `25434` is used (this is chosen to avoid clashes with any locally running databases).

## Adding Data to The Database

We can use the OGR tool [ogr2ogr](https://gdal.org/programs/ogr2ogr.html) installed on the MapServer container to add datasets to the PostgreSQL database.

```bash
# connect to the MapServer Docker image which includes OGR tools for importing data
docker exec -it mapserver2 bash
# navigate to the folder containing the OSM FlatGeobuf files
cd /etc/mapserver/data/osm
# import the water polygons dataset to the Postgres database in the Postgres Docker image
ogr2ogr -f "PostgreSQL" PG:"dbname=gis user=docker password=docker host=db port=5432" -nln water_a water_a.fgb
# now check the data details in the database
ogrinfo PG:"host=db user=docker password=docker dbname=gis port=5432" water_a -summary
```

## Code

<!--

Online example not available as no PostGIS installation on the server

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/postgis.html"></iframe>
</div>
-->

!!! example "Exercise Links"

    - MapServer request: <http://localhost:7000/?map=/etc/mapserver/postgis.map&mode=map&layer=water>
    - OpenLayers example: <http://localhost:7001/postgis.html>

??? JavaScript "postgis.js"

    ```js
    --8<-- "postgis.js"
    ```

??? Mapfile "postgis.map"

    ``` scala
    --8<-- "postgis.map"
    ```

## Exercises

1. Try and load another dataset into the database using the `ogr2ogr` approach above.
2. Now add a new layer to the Mapfile to display the layer. You can make a direct request to MapServer in the form:
  <http://localhost:7000/?map=/etc/mapserver/postgis.map&mode=map&layers=water%20NEWLAYERNAME>.
3. Now update the JS file so the layer is visible as part of the interactive map, through WMS:

    ```js
      source: new ImageWMS({
          url: mapserverUrl + mapfilesPath + 'postgis.map&',
          params: { 'LAYERS': 'water,NEWLAYERNAME', 'STYLES': '' },
          ratio: 1
      }),
    ```
