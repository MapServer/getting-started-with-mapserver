# Vector Tiles

## Overview

This example displays [Mapbox Vector Tiles](https://mapserver.org/development/rfc/ms-rfc-119.html) for a simplified countries dataset from [Natural Earth](https://www.naturalearthdata.com/). 

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/vector-tiles.html"></iframe>
</div>

## Mapfile Configuration

The Mapbox Vector Tile (MVT) output format is available by default in MapServer, and so no particular changes are required in a Mapfile to
serve vector tiles.

## Adding Vector Tiles to OpenLayers


There are two ways to request vector tiles from MapServer: 

1. Using [Tile Mode](https://mapserver.org/output/tile_mode.html), as in the [Image Tiles example](tiles.md). The only change is to add `&map.imagetype=mvt` to the request string.

2. Using a [WMS](wms.md) interface, and adding the following to the
request strings - `&FORMAT=application/x-protobuf`.

In this example we are are using the tile mode approach, based on the
[OpenLayers vector tile example](https://openlayers.org/workshop/en/vectortile/interact.html). We supply a template URL, and make sure we include `&map.imagetype=mvt` as part of the querystring:

```js
new VectorTileLayer({
    source: new VectorTileSource({
        format: new MVT(),
        url:
            mapserverUrl + mapfilesPath + 'vector-tiles.map&MODE=tile&TILE={x}+{y}+{z}&LAYERS=countries&map.imagetype=mvt',
    }),
    style: function (feature) {
        return new Style({
            stroke: new Stroke({
                color: 'rgb(66, 133, 244)', // Light blue border color
                width: 2, // Border width
            })
        });
    },
}),
```

## Code

!!! example

    - Local OpenLayers example: <http://localhost:7001/vector-tiles.html>

??? JavaScript "vector-tiles.js"

    ``` js
    --8<-- "vector-tiles.js"
    ```

??? Mapfile "vector-tiles.map"

    ``` scala
    --8<-- "vector-tiles.map"
    ```

## Exercises

1. Update the layer to use the `data/naturalearth/ne_110m_lakes` dataset.
2. Update the OpenLayers style to use a blue fill for the lakes. In the `Style` function you will need to uncomment the `fill` JavaScript.
   Experiment with different colour values for the `fill` and `stroke`.






