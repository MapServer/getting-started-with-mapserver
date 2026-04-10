# Web Coverage Services (WCS)

## Overview

This tutorial demonstrates the [WCS Server](https://mapserver.org/ogc/wcs_server.html) capabilities of MapServer.
We'll be using [WCS 2.0](https://mapserver.org/ogc/wcs_server.html#wcs-2-0) for this tutorial, and will serve a
Cloud-Optimized GeoTIFF (COG) from the Estonian Land Board as the source dataset. The dataset is a Digital Terrain Model (DTM) with a 1 m resolution.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/wcs.html"></iframe>
</div>

## WCS Requests

Some sample MapServer requests for testing the WCS service are listed below. You can test these in your browser.

- [GetCapabilities](http://localhost:7000/?map=/etc/mapserver/wcs.map&SERVICE=WCS&REQUEST=GetCapabilities&VERSION=2.0.1)
- [DescribeCoverage 2.0](http://localhost:7000/?map=/etc/mapserver/wcs.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=DescribeCoverage&COVERAGEID=dtm)
- [GetCoverage 2.0 image/tiff full](http://localhost:7000/?map=/etc/mapserver/wcs.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=dtm&FORMAT=image/tiff)

You can also connect to the MapServer Docker container and use `mapserv` to test the requests from the command line.

```bash
docker exec -it mapserver bash
mapserv -nh "QUERY_STRING=map=/etc/mapserver/wcs.map&SERVICE=WCS&REQUEST=GetCapabilities&VERSION=2.0.1"
```

## Source Dataset

Let's get some information about the source dataset using the GDAL CLI command[gdal raster info](https://gdal.org/en/latest/programs/gdal_raster_info.html)
(the modern equivalent of `gdalinfo`).

```bash
gdal raster info /etc/mapserver/data/raster/54752_dtm_1m.tif
```

The truncated output is shown below.

```
Driver: GTiff/GeoTIFF
Files: /etc/mapserver/data/raster/54752_dtm_1m.tif
       /etc/mapserver/data/raster/54752_dtm_1m.tif.aux.xml
Size is 5000, 5000
Coordinate System is:
PROJCRS["Estonian Coordinate System of 1997",
...
    ID["EPSG",3301]]
Origin = (655000.000000000000000,6475000.000000000000000)
Pixel Size = (1.000000000000000,-1.000000000000000)
...
Image Structure Metadata:
  LAYOUT=COG
...
Center      (  657500.000, 6472500.000) ( 26d41'30.35"E, 58d21'52.44"N)
Band 1 Block=512x512 Type=Float32, ColorInterp=Gray
  Min=30.680 Max=83.205
  Minimum=30.680, Maximum=83.205, Mean=60.461, StdDev=9.347
  NoData Value=-9999
  Overviews: 2500x2500, 1250x1250, 625x625, 312x312
  Metadata:
    STATISTICS_MAXIMUM=83.205001831055
...
```

From the output we can see that the dataset is in the [EPSG:3301](https://spatialreference.org/ref/epsg/3301/) coordinate reference system, with an origin at (655000, 6475000)
and a pixel size of 1 × 1 (with a negative Y resolution, as is typical for north-up rasters). The `LAYOUT=COG` indicates that the file is structured as a Cloud-Optimized GeoTIFF (COG).

## Configuring a Mapfile for WCS

The Mapfile for the WCS service is similar to a WMS Mapfile, but with some differences. The `LAYER` type is set to `RASTER`, and the `METADATA` section contains
keywords prefixed with `wcs_` to specify the WCS parameters.

```scala
WEB
    METADATA
        "wcs_enable_request" "*"
        "wcs_srs" "EPSG:4326 EPSG:3857"
        "wcs_title" "Example WCS Mapfile"
        "wcs_description" "Test description"
        "wcs_onlineresource" "http://localhost:7000/"
    END
END
```

If the Mapfile is used for multiple services such as WMS and WCS, a single metadata item can be specified using the `ows_` prefix, for example `ows_title`.

[LAYER METADATA](https://mapserver.org/ogc/wcs_server.html#layer-object-metadata) can also be used to specify additional information about the coverage, 
but is not required for this tutorial.

The [OUTPUTFORMAT](https://mapserver.org/mapfile/outputformat.html) defines the properties of the output format.
In this case we are defining a custom output format for GeoTIFFs with a `FLOAT32` data type to match the source raster
and ensure that the full precision of the source raster is preserved in WCS responses.

```scala
OUTPUTFORMAT
    NAME "GEOTIFF"
    DRIVER "GDAL/GTiff"
    MIMETYPE "image/tiff"
    IMAGEMODE FLOAT32
    EXTENSION "tif"
END
```

We can use the full power of GDAL to define custom output formats. For example, we could define a COG output format
by switching to the [COG Driver](https://gdal.org/en/latest/drivers/raster/cog.htm), and add statistics to the output file by adding the `STATISTICS=YES` format option:

```scala
OUTPUTFORMAT
    NAME "GEOTIFF_COG"
    DRIVER "GDAL/COG"
    MIMETYPE "image/tiff"
    IMAGEMODE FLOAT32
    EXTENSION "tif"
    FORMATOPTION "STATISTICS=YES"
END
```

## Requesting a WCS in OpenLayers

Typically WCS requests are made from client applications such as QGIS, ArcGIS Pro, or custom JS code in web applications to download the raw raster data,
rather than to display it as a map image. However, for the purposes of this tutorial we will be using OpenLayers to make requests to the WCS and display the results.
WCS is not natively supported in OpenLayers, but we can use the [ImageWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS.html) source as a workaround
by overriding the request parameters to call WCS, and display the results as an image layer on the map.

!!! tip

    The `COVERAGEID` corresponds to the MapServer `LAYER` `NAME`

## Code

??? JavaScript "wcs.js"

    ```js
    --8<-- "wcs.js"
    ```

??? Mapfile "wcs.map"

    ``` scala title="wcs.map"
    --8<-- "wcs.map"
    ```

## Exercises

1. From the command line, test the WCS 2.0.1 protocol by making a `GetCoverage` request and saving the output as a GeoTIFF using the configured `OUTPUTFORMAT` (MapServer format name, not a MIME type).
   Then use `gdal raster info` to check the output file.

```
mapserv -nh "QUERY_STRING=map=/etc/mapserver/wcs.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=dtm&FORMAT=GEOTIFF&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326&SUBSET=x(26.6507,26.7362)&SUBSET=y(58.3414,58.3879)&SCALESIZE=x(400),y(400)" \
> output.tif
gdal raster info output.tif
```

2. Add the COG output format to the Mapfile and make a `GetCoverage` request to download a COG-formatted output. Check the output file with `gdal raster info` to see the difference in metadata.

3. Update the JavaScript code to test the WCS 1.0.0 protocol. This requires different parameters to be passed in the requests, 
   for example `COVERAGEID` becomes `COVERAGE`, and the CRS parameters are different. You can also remove the entire `imageLoadFunction` as WCS 1.0.0
   more closely matches the WMS protocol, using `BBOX`,`WIDTH`, and `HEIGHT` parameters to specify the area and size of the output image.

```js
params: {
    SERVICE: 'WCS',
    VERSION: '1.0.0',
    REQUEST: 'GetCoverage',
    FORMAT: 'image/png',
    COVERAGE: 'dtm',
    CRS: 'EPSG:3857',
    RESPONSE_CRS: 'EPSG:3857',
},
```

## Possible Errors

```
msWCSGetCoverage20(): WCS server error. Raster size out of range, width and height of resulting coverage must be no more than MAXSIZE=4096.
```

Set the [MAXSIZE](https://mapserver.org/mapfile/map.html#mapfile-map-maxsize) directive in the `MAP` to a larger value. By default, this is set to 4096.

## Further Reading

- [MapServer WCS Use Cases](https://mapserver.org/ogc/wcs_format.html)
- [WCS and NULL Values](https://github.com/geographika/wcs-test)
