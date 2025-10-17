# Web Feature Services

## Overview

In this exercise we'll create a Mapfile that can be used to serve data
as a WFS. We'll be using the "Populated Places" from [Natural Earth](https://www.naturalearthdata.com/) as the data source.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/wfs.html"></iframe>
</div>

## Configuring a MAP for WFS

Similar to other OGC services, setting up a Mapfile to serve a WFS uses
keywords in `METADATA` blocks.

By default WFS output is XML. We can however configure it to output other formats such as GeoJSON by adding an [OUTPUTFORMAT](https://mapserver.org/mapfile/outputformat.html) block to the Mapfile:

```scala
OUTPUTFORMAT
    NAME "geojson"
    DRIVER "OGR/GEOJSON"
    MIMETYPE "application/json; subtype=geojson; charset=utf-8"
    FORMATOPTION "FORM=SIMPLE"
    FORMATOPTION "STORAGE=memory"
    FORMATOPTION "LCO:NATIVE_MEDIA_TYPE=application/vnd.geo+json"
    FORMATOPTION "USE_FEATUREID=true" # ensure GeoJSON output has an id property
END
```

We then need to add this format to the list of formats returned by the service:

```scala
WEB
  METADATA
    ...
    "wfs_getfeature_formatlist" "geojson" # we could also return more complex types such as shapezip
  END
END
```

We also need to make sure that any projection requested by a client application is allowed:

```scala
WEB
  METADATA
    ...
    "wfs_srs" "EPSG:4326 EPSG:3857"
    # we can also use ows_ to set these properties for all OWS services
    # such as WMS, WFS, and WCS
    # "ows_srs" "EPSG:4326 EPSG:3857"
  END
END
```

See the [WFS Server](https://mapserver.org/ogc/wfs_server.html) documentation for more details.

## Configuring a LAYER for WFS

At the `LAYER` level there are some additional settings that need to be configured.


!!! tip

    It is good practice to set an `EXTENT` on the `LAYER`. If not set then MapServer tries to calculate this dynamically so it can return the extent in requests such as `GetCapabilities`. This can dramatically slow down the performance of the layer. 

We set a unique field name in the `METADATA` using `gml_featureid`. Without this not all features may be returned.

We also need to configure which feature properties are returned by the service.
We can provide a list of field names, or we can use the `all` keyword to return all properties.

We can also manually define the field type for each property, or we can let MapServer calculate these from the source dataset using `"gml_types" "auto"`.

```scala
LAYER
  ...
  METADATA
      "gml_featureid" "ne_id"
      "gml_include_items" "all"
      "gml_types" "auto"
  END
```        

The `METADATA` blocks are very flexible, and allow different titles to be applied to the layer for different services, for example:

```scala
LAYER
  ...
  METADATA
      "wfs_title" "World Cities"
      "wms_title" "Cities of the World"
      ...
  END
```     

## Other Mapfile Notes

The Mapfile contains a [LAYER FILTER](https://mapserver.org/mapfile/layer.html#mapfile-layer-filter) to limit the features in the layer. 

```scala
FILTER ([pop_max] > 1000000) # only return places with a population > 1 million
```

## Requesting a WFS in OpenLayers

In OpenLayers we create a [VectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html) with a [VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html). 
The URL for the layer specifies GeoJSON as the format to use: `&outputFormat=geojson`. 

The code used for this example is based on the [WFS example](https://openlayers.org/en/latest/examples/vector-wfs.html). Every time the OpenLayers map is moved a request is made to return features. 
```js
const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
        const url = mapserverUrl + mapfilesPath + 'wfs.map&service=WFS&' +
            'version=2.0.0&request=GetFeature&typename=places&' +
            'outputFormat=geojson&crsName=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857';
        return url;
    },
    strategy: bboxStrategy,
});
```

As a WFS returns raw features we need to apply styling in the client. In this example we create a function that returns a circle style:

```js
function createStyle(feature) {
    return new Style({
        image: new CircleStyle({
            radius: 5 + feature.get('rank_min'),
            fill: new Fill({
                color: [255, 153, 0, 0.8],
            }),
        }),
        ...
    });
}
...
  new VectorLayer({
      style: createStyle,
      source: vectorSource
  }),

```

## Testing on the Command Line

We can test the Mapfile and WFS responses on the command line as follows:

```bash
docker exec -it mapserver /bin/bash
mapserv -nh "QUERY_STRING=map=/etc/mapserver/wfs.map&service=WFS&version=2.0.0&request=GetFeature&typeName=places&outputFormat=geojson&crsName=EPSG:3857&bbox=-59223902.72157662,-3903081.7252075593,-14974405.131250374,19995821.45447336,EPSG:3857"
```

## Code

??? JavaScript "wfs.js"

    ```js
    --8<-- "wfs.js"
    ```

??? Mapfile "wfs.map"

    ``` scala title="wfs.map"
    --8<-- "wfs.map"
    ```

## Exercises

1. Change the `MAP` and `LAYER` WFS metadata, and view the GetCapabilities document.
2. Try limiting the `gml_include_items` to a single attribute `name`.
3. Try adding a new `shapezip` `OUTPUTFORMAT`, and testing the response on the command line. You can redirect it to a file using ` > test.zip`. Remember to add the format to `wfs_getfeature_formatlist` in the Mapfile, and to `outputFormat` in the request string.

    ```scala
    OUTPUTFORMAT
        NAME "shapezip"
        DRIVER "OGR/ESRI Shapefile"
        FORMATOPTION "STORAGE=filesystem"
        FORMATOPTION "FORM=zip"
        FORMATOPTION "LCO:SPATIAL_INDEX=YES"
        FORMATOPTION "LCO:RESIZE=YES"
    END
    ```

<!--

This is no longer the case:

To make the layer selectable a [TEMPLATE](https://mapserver.org/mapfile/layer.html#mapfile-layer-template) value must be set. This can be *any* value. In older MapServer applications this would have been a template HTML file on disk, but for WFS it simply lets MapServer know attributes are accessible for this layer.

```scala
LAYER
  ...
  TEMPLATE "ttt"
```
-->