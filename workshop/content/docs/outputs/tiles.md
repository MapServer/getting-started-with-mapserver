# Image Tiles

## Overview

MapServer can serve out image tiles using [Tile Mode](https://mapserver.org/output/tile_mode.html). This example uses a countries dataset from [Natural Earth](https://www.naturalearthdata.com/). 

Tiles will always be in the
Web Mercator (`EPSG:3857`) projection, and can easily be added to client JavaScript applications such as OpenLayers and Leaflet. Tiles are also easy to cache using software such as [MapCache](https://mapserver.org/mapcache/).

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/tiles.html"></iframe>
</div>

## Mapfile Notes

There are no specific changes required to allow Mapfile layers to be accessed using [Tile Mode](https://mapserver.org/output/tile_mode.html). However there are some `METADATA` settings that can be used to configure tile mode. See [tile mode configuration](https://mapserver.org/output/tile_mode.html#configuration) in the docs.

```scala
WEB
    METADATA
        "tile_map_edge_buffer" "10"
        "tile_metatile_level" "0"
    END
END
```


!!! tip

    It is good practice to always set a `PROJECTION` block on the `LAYER` - even if it is in the same projection as the `MAP`.     

## Requesting Tiles in OpenLayers

A [TileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html) is simple to add to an OpenLayers map. We simply provide a template URL as the [XYZ](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html) source, and add `&MODE=tile`:

```js
new TileLayer({
    source: new XYZ({
        url: mapserverUrl + mapfilesPath + 'tiles.map&MODE=tile&TILE={x}+{y}+{z}&LAYERS=countries',
    }),
}),
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/points.map&mode=map&layer=pois>
    -  MapServer request: <http://localhost:7000/?map=/etc/mapserver/tiles.map&MODE=tile&TILE=0+0+0&LAYERS=countries&TILEMODE=gmap>
    - Local OpenLayers example: <http://localhost:7001/tiles.html>

??? JavaScript "tiles.js"

    ``` js
    --8<-- "tiles.js"
    ```

??? Mapfile "tiles.map"

    ``` scala
    --8<-- "tiles.map"
    ```

## Exercises

1. Change the background colour of the `MAP` and tiles by modifying the `IMAGECOLOR "#ADD8E6"` setting. [#ADD8E6](https://www.color-hex.com/color/add8e6)
  is "LightBlue".
2. Uncomment the `LABEL` block in the Mapfile to add labels to the tiles. You will notice that the country names are repeated several times, as they are shown for each tile. Try setting the `tile_metatile_level` value to "1" and then "2". This will reduce label repetition, but take longer to render. 

    ```scala
    METADATA
        "tile_map_edge_buffer" "10"
        "tile_metatile_level" "0"
    END
    ```

## Possible Errors

* 
    ```
    "mapserv(): Web application error. No way to generate map extent. "
    ```

    **Resolution**: ensure the parameter order in the JS client is in the format `&TILE={x}+{y}+{z}&LAYERS`. Other tile services
    often use the zoom level as the first parameter, for example `{z}/{x}/{y}`.




