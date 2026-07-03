# OpenLayers

MapServer runs on a server and publishes data via web services. You can view this data on the command line or in a browser by creating URLs, but it is usually accessed through a client application.

This could be a desktop GIS like QGIS or ArcGIS Pro, or through a web browser using a JavaScript mapping library like Leaflet or OpenLayers.

This workshop uses OpenLayers for the exercises because it supports many OGC standards published by MapServer and is an OSGeo project like MapServer.

![OpenLayers logo](../assets/images/OpenLayers_logo.png "OpenLayers logo")

To complete the exercises, you will need to edit some HTML and JavaScript code, but it will be simple enough that no prior experience in these languages is required.

A useful introduction to OpenLayers can be found [here](https://openlayers.org/workshop/en/).

## HTML example pages

The HTML pages are served using a Docker container, and when the containers are
running an index page for all workshop exercises is available at <http://localhost:9091/>. 

The HTML files used in the workshop are located in `exercises/app`.
The JavaScript files can be found in `exercises/app/js`. These files can be edited and changes viewed in the browser. 

To display MapServer WMS services we use an [ImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html)
with an [ImageWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html) source.

These are created as follows:

```js
new ImageLayer({
    source: new ImageWMS({
        url: mapserverUrl + mapfilesPath + 'points.map&',
        params: { 'LAYERS': 'pois', 'STYLES': '' }
    }),
}),
```

The `LAYERS` parameter can be set to the Mapfile `MAP NAME` to show all layers, or you can add individual
layers using a comma-separated list of `LAYER NAME`.

## WMS

We use the WMS protocol to serve data. To configure this in our Mapfiles we need to include the following `WEB` block:

```scala
WEB
    METADATA
        ows_enable_request "*" # this enables all OGC protocols supported by MapServer
        ows_srs "EPSG:4326 EPSG:3857" # we ensure Web Mercator is available as this is the projection we use in our OL maps
    END
END
```

## Centres and Extents

In our OpenLayers maps we often want to set an initial extent or centre. If our Mapfile contains an `EXTENT` in a different projection we can use the GDAL programs installed on the Docker image to convert coordinates to the OpenLayers projection:


```bash
# connect to the Docker image
docker exec -it mapserver /bin/bash

# convert the bottom-left coordinate from EPSG:4326 to EPSG:3857
echo "26.668 58.339" | gdaltransform -s_srs EPSG:4326 -t_srs EPSG:3857
# same for the top-right coordinate
echo "26.796 58.409" | gdaltransform -s_srs EPSG:4326 -t_srs EPSG:3857

# to calculate centres we can use simple maths and Python
# centre X (longitude)
python -c "print((26.668 + 26.796) / 2)"
# centre Y (latitude)
python -c "print((58.339 + 58.409) / 2)"
```