# Working with GDAL Vector Pipelines

## Overview

MapServer can dynamically run a [GDAL Vector Pipeline](https://gdal.org/en/latest/programs/gdal_vector_pipeline.html), and render its output -
all through a simple Mapfile.

In this workshop we'll use the Tartu roads dataset used in the [Line Styling](/mapfile/lines/) exercise, dynamically
buffer it using GDAL, and display the result in OpenLayers using a MapServer WMS.

This is a simple example of a pipeline, but additional steps can be chained together to create more complex workflows.
MapServer reads a vector pipeline using the [GDALG: GDAL Streamed Algorithm](https://gdal.org/en/latest/drivers/vector/gdalg.html) driver.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/gdalg.html"></iframe>
</div>

The pipeline we will be running in this example reads a dataset from a FlatGeoBuf file, and applies
a buffer to it:

<div>
<object
    type="image/svg+xml"
    data="/assets/images/roads.gdalg.svg"
    width="100%"
    height="200">
</object>
</div>


## Checking the Pipelines with GDAL

Before configuring MapServer, it is often easier to test your pipelines directly with GDAL, to ensure they run correctly.
Run the commands below to connect to the MapServer Docker container and use GDAL to get information about the pipelines.

```bash
# open a shell inside the MapServer container
docker exec -it mapserver /bin/bash

# check the dataset used in the pipeline
gdal vector info data/osm/roads.fgb

# inspect the a pipeline JSON file included in the container
gdal vector info roads.gdalg.json

# test an inline pipeline using a single-quoted string (recommended)
gdal vector info '{"type": "gdal_streamed_alg","command_line": "gdal vector pipeline ! read /etc/mapserver/data/osm/roads.fgb ! geom buffer --distance=0.0001"}'

# alternatively escape the double quotes
gdal vector info "{\"type\": \"gdal_streamed_alg\",\"command_line\": \"gdal vector pipeline ! read data/osm/roads.fgb ! geom buffer --distance=0.0001\"}"
```

## The Mapfile

### Embedding Pipelines in a Mapfile

The pipeline `LAYER` in this example uses `CONNECTIONTYPE OGR` and includes the GDAL pipeline "inline" - meaning the pipeline is defined
directly in the Mapfile. Our example pipeline looks like this:

```scala
CONNECTION '{"type": "gdal_streamed_alg","command_line": "gdal vector pipeline ! read /etc/mapserver/data/osm/roads.fgb ! geom buffer --distance=0.0001"}'
DATA "0"
```

Key points to note:

- `DATA "0"` tells MapServer to use the first (index 0) layer in the connection. Since the pipeline returns a single dataset, this will correspond
  to the buffered roads.
- When using an inline GDAL pipeline, you must provide the absolute path to any datasets used by the pipeline.
- GDAL requires a valid JSON string for the pipeline. All property names and string values must use double quotes.

In a Mapfile, you have two options for embedding JSON:

1. Wrap the JSON string in single quotes (as in the example above) - this is simpler and easier to read or copy/paste.
2. Escape the double quotes using `\"` as in the example below:

  ```scala
  CONNECTION "{\"type\": \"gdal_streamed_alg\",\"command_line\": \"gdal vector pipeline ! read /etc/mapserver/data/osm/roads.fgb ! geom buffer --distance=0.0001\"}"
  ```

### Referencing Pipelines in a JSON File

MapServer can also reference a JSON file containing a pipeline, which makes it easy to test and reuse the pipeline with GDAL.
By convention GDALG files should use the `.gdalg.json` extension.

```scala
CONNECTION "roads.gdalg.json"
DATA "0"
```

The contents of pipeline JSON file `roads.gdalg.json` are shown below. Notice that the dataset path `data/osm/roads.fgb` is relative to the JSON file.

Using relative paths in a JSON file makes the pipeline more portable, because it can be moved to a different folder or system without changing the dataset paths.

```json
{
    "type": "gdal_streamed_alg",
    "command_line": "gdal vector pipeline ! read data/osm/roads.fgb ! geom buffer --distance=0.0001"
}
```

### Hatch Styling

Finally, we use a [hatch symbol](https://mapserver.org/mapfile/symbol.html#mapfile-symbol-type) to style the buffered roads.
Hatch symbols allow you to add patterned fills, and you can adjust their angle, width, and size in the [STYLE](https://mapserver.org/mapfile/style.html) block.

```scala
SYMBOL
  NAME "hatchsymbol"
  TYPE hatch
END
...
LAYER
  CLASS
    STYLE
      SYMBOL "hatchsymbol"
      COLOR "#78C8FF"
      WIDTH 0.1
      ANGLE 45
      SIZE 8
    END
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/gdalg.map&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=TRUE&LAYERS=buffered_roads%2Croads&WIDTH=1707&HEIGHT=848&CRS=EPSG%3A3857&BBOX=2974643.6269619283%2C8046226.818245997%2C2976682.478528896%2C8047239.608870775>
    - Local OpenLayers example: <http://localhost:7001/gdalg.html>

??? JavaScript "gdalg.js"

    ``` js
    --8<-- "gdalg.js"
    ```

??? Mapfile "gdalg.map"

    ``` scala
    --8<-- "gdalg.map"
    ```

## Exercises

1. Switch to using the JSON file - replace the inline GDAL pipeline with `roads.gdalg.json` in your Mapfile.

2. Extend the GDAL pipeline - add another processing step to the pipeline.
   Refer to the [GDAL Vector Pipeline documentation](https://gdal.org/en/latest/programs/gdal_vector_pipeline.html) for examples of available operations.

3. Experiment with hatch styling - adjust properties such as `ANGLE` and `SIZE` in your `STYLE` block
   to see how the hatch pattern changes.
