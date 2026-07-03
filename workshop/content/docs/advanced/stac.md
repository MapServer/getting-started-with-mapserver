# Working with STAC - SpatioTemporal Asset Catalogs

## Overview

MapServer can display data directly from a STAC server using GDAL's [STACIT driver](https://gdal.org/en/latest/drivers/raster/stacit.html).

In this example, we will build on the [Download data from a STAC API using GDAL and the command line](https://stacspec.org/en/tutorials/gdal_cli/) tutorial,
and demonstrate how to render data from Microsoft's Planetary Computer using a STAC connection.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/stac.html"></iframe>
</div>

## Checking the Data using GDAL

First, let's inspect the data using GDAL command-line tools. Since GDAL is already installed in the MapServer Docker container, 
we can connect to the container and run the necessary commands:

```bash
# open a bash shell
docker exec -it mapserver /bin/bash
# check the GDAL version
gdal --version
# check we have the STACIT driver
gdal vector --formats | grep STACIT
# STACIT -raster- (rovs): Spatio-Temporal Asset Catalog Items
```

First, let's retrieve information about the 2021 LCMAP primary land cover classification (`lcpri`) asset using GDAL:

```bash
gdal raster info "STACIT:\"https://planetarycomputer.microsoft.com/api/stac/v1/search?&collections=usgs-lcmap-conus-v13&datetime=2021-01-01/2021-12-31\":asset=lcpri" --output-format text
```

We can also provide a bounding box to inspect the file names and details for a specific area:

```bash
gdal raster info "STACIT:\"https://planetarycomputer.microsoft.com/api/stac/v1/search?&collections=usgs-lcmap-conus-v13&datetime=2021-01-01/2021-12-31&bbox=-73.94658,41.95589,-73.88281,42.00546\":asset=lcpri" --output-format text
```

To get statistics for the raster data in the selected area, use the `--stats` flag:

```bash
gdal raster info "STACIT:\"https://planetarycomputer.microsoft.com/api/stac/v1/search?&collections=usgs-lcmap-conus-v13&datetime=2021-01-01/2021-12-31&bbox=-73.94658,41.95589,-73.88281,42.00546\":asset=lcpri" --stats
```

At the end of the output, GDAL lists the bands and their data types. We will use this information later when writing our Mapfile.

```json
"raster:bands":[
    {
    "data_type":"uint8",
    "stats":{
        "minimum":1.0,
        "maximum":8.0,
        "mean":3.475,
        "stddev":1.443
    },
    "nodata":0
    }
],
```

When inspecting the dataset with GDAL, `null` is returned for the `proj:epsg` value. Looking at the `projjson` property, the conversion method is listed as "Albers Equal Area".
This means the dataset uses a custom projection without an official EPSG code. While MapServer can handle custom projections, for the purposes of this workshop we will use 
[EPSG:5070](https://spatialreference.org/ref/epsg/5070/) in our Mapfile. EPSG:5070 corresponds to NAD83 / Conus Albers, 
a standard Albers Equal Area implementation for the United States, which works well with this dataset.

```json
"proj:epsg":null,
"proj:projjson":{
    "$schema":"https://proj.org/schemas/v0.7/projjson.schema.json",
    "type":"ProjectedCRS",
    "name":"AEA        WGS84",
    "base_crs":{
    "type":"GeographicCRS",
    "name":"WGS 84",
    ...
    },
    "id":{
        "authority":"EPSG",
        "code":4326
    }
    ...
    "conversion":{
      "name":"unnamed",
      "method":{
        "name":"Albers Equal Area",
        "id":{
        "authority":"EPSG",
        "code":9822
        }
    },
```


## The Mapfile

In this Mapfile, we use the `BBOX` parameter sent by WMS clients (such as OpenLayers) to dynamically update the `DATA` clause. We accomplish this using
[runtime substitution](https://mapserver.org/cgi/runsub.html) and by defining the `BBOX` parameter in the `WEB` `VALIDATION` block. 
A regular expression is used to ensure that the parameter is in the expected format.

```scala
WEB
  VALIDATION
    # check the parameter is in the form -74.134,41.871,-73.694,42.089
    BBOX '^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$'
  END
```

Whenever a `BBOX` parameter is passed to MapServer in a querystring, it becomes available as the dynamic variable `%BBOX%` in the Mapfile. 

In this example, we use `%BBOX% ` to dynamically update the STAC `bbox` parameter, allowing the Mapfile to request only the data for the area currently viewed by the WMS client.

```scala
LAYER
  NAME "lcpri"
  TYPE RASTER
  DATA 'STACIT:\"https://planetarycomputer.microsoft.com/api/stac/v1/search?&collections=usgs-lcmap-conus-v13&datetime=2021-01-01/2021-12-31&bbox=%BBOX%\":asset=lcpri'
```

In the OpenLayers client, we use WMS 1.1.1 because its `BBOX` coordinate order matches the longitude/latitude order used by the STAC `bbox` parameter.

By contrast, WMS 1.3.0 uses a latitude/longitude order for its BBOX when using EPSG:4326, which can cause coordinate mismatches if used directly with STAC queries.

```js
new ImageLayer({
    source: new ImageWMS({
        url: mapserverUrl + mapfilesPath + 'stac.map&',
        params: { 'LAYERS': 'lcpri', 'STYLES': '', VERSION: '1.1.1' }
    }),
```

## Code

!!! example

    - Local OpenLayers example: <http://localhost:9091/stac.html>

??? JavaScript "stac.js"

    ``` js
    --8<-- "stac.js"
    ```

??? Mapfile "stac.map"

    ``` scala
    --8<-- "stac.map"
    ```

## Exercises

- The [metadata](https://data.usgs.gov/datacatalog/metadata/USGS.6759c005d34edfeb8710a490.xml) provides what pixel values represent in the dataset.
  Add new classes to the Mapfile to represent each of the 8 landcover types.

  ```xml
  <edom>
    <edomv>3</edomv>
    <edomvd>
    Grass/Shrub. Land predominantly covered with shrubs and perennial or annual natural and domesticated grasses (e.g., pasture),
    forbs, or other forms of herbaceous vegetation. The grass and shrub cover must comprise at least 10% of the area and tree cover is less than 10% of the area.
    </edomvd>
    <edomvds>LCMAP Legend Land Cover Class Descriptions</edomvds>
  </edom>
  ```

- Comment-out the classes and uncomment the `PROCESSING` directives to create a black and white output of the land cover dataset.

## Further Links

- <https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/>
