# Raster Data

## Overview

MapServer can serve both [vector](https://mapserver.org/input/vector/index.html) and [raster](https://mapserver.org/input/raster.html) data.

The dataset used in this example is elevation data from the [Estonian Geoportal](https://geoportaal.maaamet.ee/eng/Spatial-Data/Elevation-Data-p308.html),
and data provided by the Estonian Land Board 2024. It covers Tartu center and is from map sheet 474659.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/raster.html"></iframe>
</div>

## Viewing Dataset Details

We can view details about this dataset using [gdalinfo](https://gdal.org/programs/gdalinfo.html) which is installed on the
MapServer Docker container.

```bash
# first connect to the MapServer Docker container
docker exec -it mapserver /bin/bash

# now get some basic details about the dataset
gdalinfo /etc/mapserver/data/raster/54752_dtm_1m.tif

# we can also view these details as JSON for easier parsing
gdalinfo /etc/mapserver/data/raster/54752_dtm_1m.tif -stats -json

```

## A Raster LAYER

```scala
LAYER
  NAME "dtm"
  EXTENT 655000 6470000 660000 6475000
  STATUS OFF
  TYPE RASTER
  DATA "data/raster/54752_dtm_1m.tif"
  PROJECTION
      "epsg:3301"
  END
  COMPOSITE
      OPACITY 80
  END
  INCLUDE "terrain.include"
END
```

There are a few points to note in this Mapfile. 

## Include Files

We are making use of the [INCLUDE](https://mapserver.org/mapfile/include.html) 
directive. This allows us to include additional files within our Mapfile. Any file extensions can be used, and paths are always relative to the main
Mapfile. In this case `terrain.include` contains a list of `CLASS`es
to style the raster data. These classes were generated using a Python script - by keeping them in a separate file we can easily recreate the file
without modifying the rest of the Mapfile. INCLUDEs can also be used to help manage large Mapfiles, for example by keeping each LAYER in a separate file.
This approach also makes it easier to share LAYERs between different Mapfiles.


The `terrain.include` file shows how we can style raster data. There are classes that apply a different RGB colour to the data
based on the `[pixel]` value for each cell:

```scala
CLASS
  EXPRESSION ([pixel] >= 30.68 AND [pixel] < 37.245625)
  STYLE
    COLOR 107 129 31
  END
END

CLASS
  EXPRESSION ([pixel] >= 37.245625 AND [pixel] < 43.81125)
  STYLE
    COLOR 107 106 26
  END
END
```

## Composite Blocks

A [COMPOSITE](https://mapserver.org/mapfile/composite.html) block is used on the layer to make it 20% transparent.

## Code

!!! example

    - MapServer request: <http://localhost:7000/?map=/etc/mapserver/raster.map&mode=map&layer=dtm>
    - OpenLayers example: <http://localhost:7001/raster.html>

??? JavaScript "raster.js"

    ``` js
    --8<-- "raster.js"
    ```

??? Mapfile "raster.map"

    ``` scala
    --8<-- "raster.map"
    ```

## Exercises

1. Try different settings for layer `OPACITY` to see its effect on the output in `raster.map`.
2. Change the `COLOR` of the first `CLASS` in `terrain.include` to highlight which pixels have values in this range. 
   Cyan (`COLOR 0 255 255`) is a good colour for highlighting.
