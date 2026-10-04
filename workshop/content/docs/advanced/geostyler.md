# Vector Styling in OpenLayers using GeoStyler

!!! warning

    This page is currently in a draft form. It may also require features
    only available in the `main` MapServer branch, and not yet released in a stable version.

## Overview

[GeoStyler](https://geostyler.org/) is *an open-source React library that enables developers to build flexible and powerful graphical user interfaces for map-styling in the browser*.

It has many different parsers that allow conversion of one style format to another. In this example, we will use the [SLD parser](https://geostyler.org/docs/usage/parsers/sld/) 
to convert SLD created by MapServer styles into GeoStyler JSON format, which can then be used to style vector layers in OpenLayers.


<div class="map" style="height: 600px; border: 1px solid black;">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/geostyler.html"></iframe>
</div>


## Mapfile Notes

### Symbols

Symbols are added to the Mapfile using `INCLUDE` directives, which allows them to be loaded into the
demo web application. The symbol `NAME` matches the `LAYER` name.

### Symbol Resolution

[RESOLUTION](https://mapserver.org/mapfile/map.html#mapfile-map-resolution) and [DEFRESOLUTION](https://mapserver.org/mapfile/map.html#mapfile-map-defresolution)
are used to control the scaling of symbols in MapServer.

When a WMS source has `serverType: 'mapserver', OpenLayers requests HiDPI images by adding
`MAP_RESOLUTION` = 90 × device pixel ratio to the request (when the ratio isn't 1).
The 90 value is [hard-coded in OpenLayers](https://github.com/openlayers/openlayers/blob/69e07d8ad933c3081cc10b8bb4a64023917661aa/src/ol/source/wms.js#L99)
and based on the OGC standard rendering pixel size of 0.28 mm (25.4 mm per inch ÷ 0.28 mm per pixel = 90.71 pixels per inch).

The device pixel ratio is a property of the browser, and can be different on different devices.
To find your browser pixel device ratio, open the developer tools and check the `window.devicePixelRatio` value.

For example, if this is `1.5`, then the `MAP_RESOLUTION` parameter sent by OpenLayers to MapServer as part of the WMS request
will be `90 * 1.5 = 135`. The image is requested at 1.5 times the size of the map. When this parameter is sent
by a client, it overrides the `RESOLUTION` value set in the Mapfile for that request.

MapServer scales symbol sizes by `RESOLUTION / DEFRESOLUTION`. Setting both to 90 keeps symbols
at the same visual size on any screen, matching the SLD sizes used for client-side styling.
When `MAP_RESOLUTION` is 135, symbols are scaled by 1.5 in an image that the browser displays 1.5 times smaller.

With MapServer's defaults of 72, symbols would instead be scaled by `135 / 72 = 1.875`
in the image, so they appear 1.25 times too large on HiDPI screens.


```scala
RESOLUTION 90 # if no MAP_RESOLUTION is provided in a request, MapServer uses this value
DEFRESOLUTION 90 # set to match OpenLayers default. MapServer default is 72
```

## Applying Styles with GeoStyler


## Code

!!! example

    - Inbuilt OpenLayers request: <http://localhost:7000/GEOSTYLER/?template=openlayers&mode=browse&layers=all>
    - OpenLayers and SLD viewer: <http://localhost:7001/geostyler.html>
    - Direct `GetStyles` request: <http://localhost:7000/?map=/etc/mapserver/geostyler.map&REQUEST=GetStyles&SERVICE=WMS&VERSION=1.3.0&LAYERS=notched-rect>

??? JavaScript "geostyler.js"

    ``` js
    --8<-- "geostyler.js"
    ```

??? Mapfile "geostyler.map"

    ``` scala
    --8<-- "geostyler.map"
    ```


## Exercises

1. Play around with the `RESOLUTION` and `DEFRESOLUTION` values in the Mapfile and see how it affects the symbol sizes.