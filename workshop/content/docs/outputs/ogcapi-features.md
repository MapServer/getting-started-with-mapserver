# OGC API - Features

## Overview

In this exercise we'll be configuring MapServer to serve out data using
MapServer's [OGC API - Features](https://mapserver.org/ogc/ogc_api.html). See the [OGC API - Features Overview](https://ogcapi.ogc.org/features/overview.html) page for more details.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/ogcapi-features.html"></iframe>
</div>


## Configuring your Mapfile

As with other OGC services most configuration is done using `METADATA` blocks. 
The prefix for the OGC API - Features metadata settings is `oga_`.

To enable the OGC API - Features enable it in the `WEB` `METADATA`, using either
`ows_enable_request` or `oga_enable_request`. We also need to set the `oga_onlineresource` value to the root of the service:

```scala
WEB
    METADATA
        ...
        ows_enable_request "*" # this enables all OGC requests
        oga_onlineresource "/ogcapi-features/ogcapi"
    END
END
```

At the `LAYER` level `gml_featureid` needs to refer to field name containing a unique value for each feature.

```scala
METADATA
    ...
    gml_include_items "all"
    gml_featureid "osm_id"
END
```

## The MapServer CONFIG File

In MapServer version 8.0 a new global [CONFIG](https://www.mapserver.org/mapfile/config.html) file was added. 

This allows us to set which URL path is handled by which Mapfile. 

The file is located at `workshop\exercises\mapfiles\mapserver.conf` (in the same folder as the Mapfiles), and is read by the Docker container.

!!! tip

    `mapserver.conf` can be edited, but any changes will only come into effect when Apache is restarted. As this is running in Docker, we restart the Docker `mapserver` container:

    ```bash
    docker restart mapserver
    ```

The key part of the `CONFIG` file are the `MAPS` section where a URL paths are paired with Mapfiles:

```scala
  MAPS
    OGCFEATURES "/etc/mapserver/ogcapi-features.map"
  END
```

The other relevant setting is the environment variable `OGCAPI_HTML_TEMPLATE_DIRECTORY` in the `ENV` section. This points to a folder containing templates used to create the HTML interface when browsing the OGC API - Features: 

```scala
ENV
    OGCAPI_HTML_TEMPLATE_DIRECTORY "/usr/local/share/mapserver/ogcapi/templates/html-bootstrap4/"
END
```

## Browsing the OGC API - Features Collections

The OGC API - Features can be viewed as HTML pages, which are rendered using templates provided by MapServer. They can also be accessed as JSON. 

The services use hierarchical URLs for example:

* The root of the service is at <http://localhost:7000/ogcapi-features/ogcapi/>
* The feature collections are listed at <http://localhost:7000/ogcapi-features/ogcapi/collections?f=html>
* The Polygon feature collection is available at <http://localhost:7000/ogcapi-features/ogcapi/collections/pois_polygon?f=html>

## Adding OGC API - Features to OpenLayers

As the OGC API - Features returns GeoJSON, adding a vector layer to OpenLayers is straightforward. We simply pass in the URL pointing to the collection items:

```js
new VectorLayer({
    style: {
        'fill-color': 'rgba(255, 255, 0, 0.7)',
        'stroke-width': 1.3,
    },
    source: new Vector({
        url: mapserverUrl + 'ogcapi-features/ogcapi/collections/pois_polygon/items?f=json&limit=500',
        format: new GeoJSON(),
    }),
}),
```    

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/ogcapi-features/ogcapi/>
    - Direct MapServer request: <http://localhost:7000/ogcapi-features/ogcapi/collections/pois/items?f=html>    
    - Local OpenLayers example: <http://localhost:7001/ogcapi-features.html>

??? JavaScript "ogcapi-features.js"

    ``` js
    --8<-- "ogcapi-features.js"
    ```

??? Mapfile "ogcapi-features.map"

    ``` scala
    --8<-- "ogcapi-features.map"
    ```

## Exercises

1. Modify the `workshop\exercises\mapfiles\railways.map` to enable the OGC API - Features. You will need to add a new entry to the `MAPS` section in `workshop\exercises\mapfiles\mapserver.conf` and restart the Docker container to be able to browse the OGC API - Features interface. 

    ```scala
    MAPS
        ...
        RAILWAYS "/etc/mapserver/railways.map"
    END
    ```

    You also need to add the following to `WEB` `METADATA` so MapServer can correctly construct the URLs: `"oga_onlineresource" "/railways/ogcapi"`

    !!! tip

        You need to add `TEMPLATE "void"` to each of the layers you want to make available through the OGC API - Features. 
        [TEMPLATE](https://mapserver.org/mapfile/layer.html#mapfile-layer-template) is a left-over from when HTML templates were used to return features, and allows the layer to be queried. 

    Once setup correctly you should be able to browse the OGC API - Features at <http://localhost:7000/railways/ogcapi/>.

## Possible Errors

- 
    ```json
    {
        "code": "ConfigError",
        "description": "InjaError error. [inja.exception.file_error] failed accessing file at '/etc/mapserver/landing.html' (landing.html). (/etc/mapserver/)."
    }
    ```

    `oga_html_template_directory` can be set either at the Mapfile level or in the CONFIG file. Mapfile takes precedence. 
