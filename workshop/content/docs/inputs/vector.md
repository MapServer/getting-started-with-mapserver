# Vector Data

## Overview

We've already seen several examples of serving vector data using a Mapfile. MapServer has native support for many 
[Vector formats](https://mapserver.org/input/vector/index.html). MapServer can also read data through [OGR](https://mapserver.org/input/vector/index.html)
- the vector component of [GDAL](https://gdal.org/), which has support for over 80 [vector drivers](https://gdal.org/drivers/vector/index.html).

Native support means the code to read the data is a part of the MapServer codebase, which can make it more optimised. 
The OGR drivers however may be better maintained. For formats which have both native and OGR support, for example Shapefiles and FlatGeobuf it is not always a clear decision which to use.

More information can be found on the [Vector Data Management & Optimization](https://mapserver.org/fr/optimization/vector.html) page in the
MapServer documentation.

<div class="map">
  <iframe src="https://geographika.github.io/getting-started-with-mapserver-demo/stars.html"></iframe>
</div>

## Remote Datasets using  Virtual File Systems

GDAL's [Virtual File Systems](https://gdal.org/user/virtual_file_systems.html) can be used to
access data over stored on a network, for example on a server or Amazon S3 bucket. 

```scala
CONNECTIONTYPE OGR
CONNECTION "/vsicurl/https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json"
```

+ GeoParquet, GeoArrow - use range requests to access only the data needed.
**Cloud-Optimised** - similar to raster data formats such as "Cloud-Optimized GeoTIFFs" - COGs.

<!--
## Extents
-->

## Code

!!! example

    - MapServer request: <http://localhost:5000/?map=/etc/mapserver/stars.map&mode=map&layer=constellations>
    - OpenLayers example: <http://localhost:5001/stars.html>

??? JavaScript

    ``` js
    --8<-- "stars.js"
    ```

??? Mapfile

    ``` scala
    --8<-- "stars.map"
    ```

## Exercises

1. Try adding a new dataset to the `stars.map`, for example `mw.json` which is at the same location as the other datasets:

    ```scala
    LAYER
        TYPE POLYGON
        NAME "milkyway"
        STATUS OFF
        # TODO add in the data connection
        COMPOSITE
            OPACITY 30
        END
        CLASS
            STYLE
                COLOR 230 230 230
                OUTLINECOLOR 50 50 50
            END
        END
    END
    ```

    In the `stars.js` you will need to ensure the `milkyway` layer is added to the OpenLayers map:

    ```js
    params: { 'LAYERS': 'constellations,stars,stars2,milkyway'},
    ```
