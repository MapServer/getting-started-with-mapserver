# Working with non-EPSG Coordinate Reference Systems

## Overview

Most geospatial workflows use EPSG-defined coordinate reference systems. However, there are cases where we need to work with custom or non-standard projections that are not included in the EPSG registry.

In this example we will be working with the [ESRI:53009](https://spatialreference.org/ref/esri/53009/) - a spherical [Mollweide projection](https://en.wikipedia.org/wiki/Mollweide_projection),
and using WMS, WFS, and WCS services to access data in this projection.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/other-projections.html"></iframe>
</div>

`ESRI:53009` can be identified using different formats, as shown in the table below:


| Format | Example |
|--------|--------|
| Authority code | ESRI:53009 |
| OGC URN | urn:ogc:def:crs:ESRI::53009 |
| OGC HTTP URI | http://www.opengis.net/def/crs/ESRI/0/53009 |

## The Mapfile

Projections are referenced in several places in the Mapfile, listed below.

The top-level projection of the Mapfile is set to `ESRI:53009`:

``` scala
PROJECTION
    "ESRI:53009"
END
```

The source data used for the "raster" and "countries" layers are in the `EPSG:4326` projection. 
These need to be set explicitly in the Mapfile using the `PROJECTION` object within the `LAYER` definition, as follows:

``` scala
LAYER
    NAME "raster"
    TYPE RASTER
    EXTENT -180 -90 180 90
    DATA "data/naturalearth/NE2_50M_SR_SMALL.tif"
    PROJECTION
        "EPSG:4326"
    END
END
```

The "cities" layer uses a GeoJSON file already in the `ESRI:53009` projection. Even though it is not strictly necessary to specify the projection for this layer,
it is good practice to do so to ensure that MapServer can correctly identify the source CRS and reproject the data as needed.

```scala
LAYER
    NAME "cities"
    TYPE POINT
    PROJECTION
        "ESRI:53009"
    END
    CONNECTIONTYPE OGR
    CONNECTION "data/naturalearth/worldcity_53009.geojson"
```

!!! note

    GeoJSON traditionally assumes EPSG:4326. Using other CRS relies on client/server
    agreement and is not part of the official GeoJSON specification.

Finally we want to make the projection available to all the WxS protocols - WMS, WFS, and WCS. This is done using the `ows_srs` metadata item in the `WEB` section of the Mapfile, as follows:

``` scala
WEB
    METADATA
        "ows_srs" "ESRI:53009 EPSG:4326"
    END
END
```

Using the `ows_` prefix makes the projection available to all OWSs (OGC Web Services), and avoids having to have duplicate entries such as `wms_srs`, `wfs_srs`, and `wcs_srs`
if we were to use the service-specific metadata items.

!!! note

    The order of the layers in the Mapfile is important when requesting a map directly using the MapServer CGI interface 
    (for example <http://localhost:7000/?map=/etc/mapserver/other-projections.map&mode=map&layer=countries&layer=cities&layer=raster>).
    The raster layer must be first in the Mapfile, otherwise the raster will be drawn on top of the vector layers and obscure them. The order of the layers in the request
    itself does not affect the rendering order, only the order in the Mapfile.

## OpenLayers

The OpenLayers client for this tutorial is set up to make requests to the WMS, WFS, and WCS services using the `ESRI:53009` projection.
The client is configured to request data in this projection and display it on the map.

OpenLayers does not include definitions for all projections by default, so we use the [proj4js](https://proj4js.org/) library
to define the `ESRI:53009` projection and register it with OpenLayers.

```js
proj4.defs('ESRI:53009',
    '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs'
);
register(proj4);

const coverageExtent = [-18019909, -9009954, 18019909, 9009954];

const mollweideProjection = new Projection({
    code: 'ESRI:53009',
    units: 'm',
    extent: coverageExtent,
    worldExtent: [-180, -90, 180, 90],
    global: true,
});

addProjection(mollweideProjection);
```

We set the projection on the map object to `ESRI:53009` so that all requests sent to MapServer return data in this projection.

```js
const map = new Map({
    target: 'map',
    layers: [imageLayer, wmsLayer, graticule, wfsLayer],
    view: new View({
        projection: 'ESRI:53009',
        center: [0, 0],
        zoom: 1,
    }),
});
```

To help visually confirm the reprojection is working correctly we add a [graticule layer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Graticule-Graticule.html) to the map, which shows the lines of latitude and longitude.
The graticule uses the `ESRI:53009` projection of the `map` object, and display lines representing degrees of latitude and longitude. We also enable labels to show the coordinates of the graticule lines.

```js
const graticule = new Graticule({
    strokeStyle: new Stroke({
        color: 'rgba(50,50,50,0.5)',
        width: 1,
    }),
    showLabels: true,
    wrapX: false
});
```

### WFS

The "cities" point layer is displayed as a WFS layer in the OpenLayers client. 
As w"e construct the URLs to send to MapServer ourselves we need to set the `SRSNAME` to `ESRI:53009` (MapServer interprets the `BBOX` values in the CRS specified by `SRSNAME`).

We need to set the `dataProjection` to `ESRI:53009` in the `GeoJSON` format options to ensure the features are correctly reprojected and displayed on the map.

```js
const wfsSource = new VectorSource({
    format: new GeoJSON({
        dataProjection: 'ESRI:53009',
    }),
    url: function (extent) {
        const [minx, miny, maxx, maxy] = extent;
        return `${url}&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature` +
            `&TYPENAMES=ms:cities` +
            `&OUTPUTFORMAT=geojson` +
            `&SRSNAME=ESRI:53009` +
            `&BBOX=${minx},${miny},${maxx},${maxy}`;
    },
    strategy: bbox,
});
```

### WMS

The "countries" polygon layer is displayed as a WMS. As the OpenLayers map itself is set to use the `ESRI:53009` projection we don't need to
specify any further parameters here.

```js
const wmsLayer = new ImageLayer({
    source: new ImageWMS({
        url: url,
        params: {
            LAYERS: 'countries',
            FORMAT: 'image/png',
            TRANSPARENT: true,
            VERSION: '1.3.0',
        },
        serverType: 'mapserver',
    }),
});
```

## WCS

!!! note

    OpenLayers does not natively support WCS. In this example we use the same approach as in the [Web Coverage Services (WCS)](../outputs/wcs.md) tutorial for testing the WCS protocol.
    Images are requested as PNGs using the [ImageWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html) class and a custom
    [imageLoadFunction](https://openlayers.org/en/latest/apidoc/module-ol_Image.html#~LoadFunction),
    as displaying GeoTIFFs directly in OpenLayers is not supported without additional libraries.

We construct the WCS request parameters manually in the `imageLoadFunction` and ensure that the `SUBSETTINGCRS` and `OUTPUTCRS` parameters are set to `http://www.opengis.net/def/crs/ESRI/0/53009`
to ensure the data is returned in the correct projection. In this example we use the OGC HTTP URI form of the CRS identifier for the CRS requests.


```js
const wcsSource = new ImageWMS({
    url,
    params: {
        SERVICE: 'WCS',
        VERSION: '2.0.1',
        REQUEST: 'GetCoverage',
        FORMAT: 'image/png',
        COVERAGEID: 'raster',
        SUBSETTINGCRS: 'http://www.opengis.net/def/crs/ESRI/0/53009',
        OUTPUTCRS: 'http://www.opengis.net/def/crs/ESRI/0/53009',
    },
    imageLoadFunction: (image, src) => {
        const srcUrl = new URL(src);
        const params = srcUrl.searchParams;

        // Get the ImageWMS params
        const bbox = params.get('BBOX').split(',');
        const width = params.get('WIDTH');
        const height = params.get('HEIGHT');

        // Replace with WCS 2.0.1 equivalents
        params.append('SUBSET', `x(${bbox[0]},${bbox[2]})`);
        params.append('SUBSET', `y(${bbox[1]},${bbox[3]})`);
        params.set('SCALESIZE', `x(${width}),y(${height})`);
        ...
```

!!! note

    `SUBSETTINGCRS` is not strictly necessary here as MapServer assumes the `SUBSET` parameters are in the same CRS as the `OUTPUTCRS`,
    but it is good practice to include it.

## Code

!!! example

    - MapServer request: <http://localhost:7000/?map=/etc/mapserver/other-projections.map&mode=map&layer=countries&layer=cities&layer=raster>
    - OpenLayers example: <http://localhost:7001/other-projections.html>

??? JavaScript "other-projections.js"

    ``` js
    --8<-- "other-projections.js"
    ```

??? Mapfile "other-projections.map"

    ``` scala
    --8<-- "other-projections.map"
    ```

## Exercises

1. Currently the CRS is specified using the `http://www.opengis.net/def/crs/ESRI/0/53009` format,
   (OGC CRS HTTP URIs) but this can also be specified using other CRS formats. 

    Update the OpenLayers WCS request parameters to use this format, and test that the requests are still working correctly.

    ```js
      // OGC URN CRS identifiers
      SUBSETTINGCRS: 'urn:ogc:def:crs:ESRI::53009',
      OUTPUTCRS: 'urn:ogc:def:crs:ESRI::53009',

      // authority codes
      SUBSETTINGCRS: 'ESRI:53009',
      OUTPUTCRS: 'ESRI:53009',
    ```

2. Update the Mapfile to use another non-EPSG projection, for example `ESRI:54030` (the [Robinson projection](https://en.wikipedia.org/wiki/Robinson_projection)).

    Test everything is configured correctly by making a direct request to the MapServer CGI interface 
    using <http://localhost:7000/?map=/etc/mapserver/other-projections.map&mode=map&layer=countries&layer=cities&layer=raster>.


## Further Reading

- [Reproject Data with GDAL Tutorial](https://gdal.org/en/latest/tutorials/reprojecting_data.html)
- [MapServer Projections](https://mapserver.org/mapfile/projection.html)
- [Spatial Reference](https://spatialreference.org/)
- [PROJ](https://proj.org/)
