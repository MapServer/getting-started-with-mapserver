# Working with an ArcGIS Feature Server

## Overview

MapServer can read JSON data from an ArcGIS Feature Server using GDAL's [ESRIJSON / FeatureService](https://gdal.org/en/stable/drivers/vector/esrijson.html) driver.
You can render data, configure WMS services and apply labels just as you would with any other MapServer data source.

In this workshop, you will also learn how to add a checkbox control to an OpenLayers map that allows users to toggle labels on and off interactively.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/arcgis.html"></iframe>
</div>

## Inspecting the Data

We can inspect the ArcGIS Feature Server data using GDAL tools available in the MapServer Docker container.
This helps verify that the connection and driver are working correctly before configuring MapServer.
Run the following command to open your container shell and get information about the service:

```bash
docker exec -it mapserver /bin/bash
gdal vector info "https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/FeatureServer/0/query?resultRecordCount=10&f=pjson" --output-format text
```

The output should look similar to the following:

```bash
INFO: Open of `https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/FeatureServer/0/query?resultRecordCount=10&f=pjson'
      using driver `ESRIJSON' successful.

Layer name: ESRIJSON
Geometry: Polygon
Feature Count: 983
Extent: (-117.462057, 33.895445) - (-117.436808, 33.911090)
Layer SRS WKT:
PROJCRS["WGS 84 / Pseudo-Mercator",
    ...
    ID["EPSG",3857]]
```

This output tells us two important things:

- The data extent (bounding box) in geographic coordinates - (-117.462057, 33.895445) to (-117.436808, 33.911090).
- The spatial reference system - EPSG:3857 (WGS 84 / Pseudo-Mercator).

We can use the extent values and projection in our Mapfile as below:

```scala
MAP
    NAME "arcgis"
    EXTENT -117.462057 33.895445 -117.436808 33.911090
    PROJECTION
        "init=epsg:4326"
    END
```

Although the Mapfile's extent here is expressed in EPSG:4326 (latitude/longitude), our OpenLayers client will use Web Mercator (EPSG:3857) coordinates.
To handle this, we can use a small MapScript Python utility to read the extent from the Mapfile and convert it to Web Mercator automatically.


```bash
$ python /scripts/extents.py --mapfile "/etc/mapserver/arcgis.map"
Original extent +init=epsg:4326: [-117.462057, 33.895445, -117.436808, 33.91109]
New extent epsg:3857: [-13075816.372770477, 4014771.4694313034, -13073005.666947436, 4016869.8241438307]
Center: [-13074411.019858956, 4015820.646787567]
```

We can then use these projected coordinates in our OpenLayers client application to set the map's center and initial view to match the location of our data:

```js
const map = new Map({
    ...
    view: new View({
        center: [-13074410.5, 4015820],
        zoom: 17,
    }),
});
```

Finally, we'll want to check which attribute fields are available in the dataset so we can choose one to use for labeling.
We can inspect the dataset details in JSON format using the ArcGIS Feature Server's REST endpoint:

```bash
gdal vector info --summary "https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/FeatureServer/0/query?resultRecordCount=10&f=pjson" --output-format json
...
      "featureCount":983,
      "fields":[
        {
          "name":"apn",
          "type":"String",
          "width":9,
          "nullable":true,
          "uniqueConstraint":false,
          "alias":"APN"
        }
      ]
    }
```

The only available attribute field in this dataset is `apn`. Since it is a string, we can use it directly for labeling features on the map.

## The Mapfile

The `LAYER` uses `CONNECTIONTYPE OGR` and points directly to the ArcGIS FeatureServer, including `f=pjson` in the query string:

```scala
CONNECTIONTYPE OGR
CONNECTION "https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/FeatureServer/0/query?f=pjson"
```

To toggle labels on and off using a query string parameter (`labels`) we make use of MapServer [runtime substitution](https://mapserver.org/cgi/runsub.html).

1. Add a `labels` parameter to the `CLASS` `VALIDATION` block and set its default value to `'hidden'`. 
2. Add an `EXPRESSION` in the class containing the labels that evaluates to **True** when `'visible' = 'visible'` and **False** when `'hidden' = 'visible'`. 

Using this mechanism, labels can be shown for features by appending `&LABELS=visible` to the request URL. By default they will be hidden.

A final point is the `PROCESSING "RENDERMODE=ALL_MATCHING_CLASSES"` directive. 

- By default, MapServer applies **only the first matching class** for each feature.
- With `ALL_MATCHING_CLASSES`, **each feature is evaluated against every class**, allowing multiple classes and styles can be applied - in this case a polygon and then a label.

An alternative approach to the above would be to use two layers - one to render the polygons, and another to render just the labels. The client application could then request **one or both**
layers via WMS. The best approach depends on the application requirements.

```scala
PROCESSING "RENDERMODE=ALL_MATCHING_CLASSES"
CLASS
...
END
CLASS
    VALIDATION
        labels '.'
        default_labels 'hidden'
    END
    EXPRESSION ('%labels%' = 'visible')
    LABEL
...
END
```

## OpenLayers

The OpenLayers client needs a way to toggle labels on and off. In `arcgis.html` we add a simple HTML checkbox and apply CSS to position it in a panel in the bottom-left corner:

```html
<div id="control-panel">
    <label>
        <input type="checkbox" id="labelsCheckbox" />
        Labels
    </label>
</div>
```

In the JavaScript file (`arcgis.js`) we then add an event listener that triggers whenever the checkbox state changes. This function:

1. Updates the WMS layer parameters sent to MapServer to include the LABELS query parameter.
2. Forces the WMS layer to refresh, so the labels are rendered or hidden immediately.

```js
const labelsCheckbox = document.getElementById('labelsCheckbox');
labelsCheckbox.addEventListener('change', (event) => {
    const showLabels = event.target.checked ? 'visible' : 'hidden';
    // update the WMS parameters
    imageLayer.getSource().updateParams({ LABELS: showLabels });

    // refresh the layer
    imageLayer.getSource().refresh();
});
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/arcgis.map&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=TRUE&LAYERS=PoolPermits&WIDTH=3840&HEIGHT=1907&CRS=EPSG%3A3857&BBOX=-13076703%2C4014686%2C-13072117.389151445%2C4016958>
    - Direct MapServer request with labels: <http://localhost:7000/?map=/etc/mapserver/arcgis.map&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=TRUE&LAYERS=PoolPermits&LABELS=visible&WIDTH=3840&HEIGHT=1907&CRS=EPSG%3A3857&BBOX=-13076703%2C4014686%2C-13072117.389151445%2C4016958>
    - Local OpenLayers example: <http://localhost:7001/arcgis.html>

??? JavaScript "arcgis.js"

    ``` js
    --8<-- "arcgis.js"
    ```

??? Mapfile "arcgis.map"

    ``` scala
    --8<-- "arcgis.map"
    ```

## Exercises

In this exercise, you will debug the application using `map2img` to compare performance between using a single layer (polygons + labels) and two layers (polygons and labels separate).

!!! note

    To ensure the labels are drawn when using a single layer, temporarily comment out the `EXPRESSION` block to ensure the labels are drawn.
    There is currently no way to add custom parameters to `map2img`. Remember to add this back when drawing two layers to avoid rendering the labels twice.

```bash
docker exec -it mapserver /bin/bash

# test a single layer with polygons and labels
map2img -m arcgis.map -l "PoolPermits" -layer_debug "PoolPermits" 1 -map_debug 5 -o PoolPermits.png

# test two layers - one polygons and the other labels
map2img -m arcgis.map -l "PoolPermits" "PoolPermitLabels" -layer_debug "PoolPermits" 1  -layer_debug "PoolPermitLabels" 1 -map_debug 5 -o PoolPermit2Layers.png

# draw map 5 times to get several map drawing times
map2img -m arcgis.map -l "PoolPermits" -c 5 -map_debug 2 -o temp.png
```

The generated images will appear in the same folder as your Mapfiles on your local machine: `getting-started-with-mapserver/workshop/exercises/mapfiles`.
Verify that the images are identical to ensure you are comparing the same outputs.

What are your timings for each approach?

<!--
Times should be almost identical as MapServer reuses the connection to the remote datasource for each layer.
msConnPoolRegister(PoolPermits,https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/FeatureServer/0/query?f=pjson,0x5f5ff6e11570)
-->