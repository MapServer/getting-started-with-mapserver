# Web Map Services

## Overview

We've been using WMS for interacting with MapServer for Mapfile examples. In this exercise we'll look in more detail at how to configure WMS services in MapServer.

The MapServer WMS documentation is available [here](https://www.mapserver.org/ogc/wms_server.html). 

## METADATA Blocks

Web services are configured using `METADATA` blocks. These are key-value pairs, for example: `"wms_title" "My WMS Services"`.

!!! tip

    It is good practice to put the key names in quotes. This is not required, but it makes it clearer
    that they are strings and not Mapfile keywords. Keys can also contain strings such as field names, which
    could contain spaces. Without quotes these will cause syntax errors in the Mapfile.

Prefixes are used to configure different types of web service. For example:

- `wms_` is used for WMS services, for example `"wms_title"` can be set in the `WEB` `METADATA` block to set the title of the WMS service. This will be seen when read with client applications such as QGIS. 
- `wfs_` is used for Web Feature Services.
- `oga_` is used for the new [OGC API - Features](/outputs/ogcapi-features/). 

!!! tip

    If settings are to be used for multiple services, then rather than duplicating values for `wms_`, `wfs_` etc. you can use the `ows_` prefix and these settings will apply to all open web services. You can still override this top-level setting for individual service types if needed.

    ```scala
    METADATA
        "ows_title" "My Services" # this will apply to WFS GetCapabilities requests
        "wms_title" "My WMS Services" # this will apply to WMS GetCapabilities requests
    END
    ```

## WMS Request Types

There are several different types of WMS requests. 

- `GetMap` - for returning map images
- `GetLegendGraphic` for returning legend images
- `GetCapabilities` for returning XML metadata of the WMS
- `GetFeatureInfo` - for returning feature attributes at a query location
- `DescribeLayer` - returns an XML description of the WMS layer(s)

More details are in [the documentation](https://www.mapserver.org/ogc/wms_server.html#how-does-a-wms-work). 

## GetLegendGraphic

A sample request for the legend for the `polygons.map` is as follows:

- <http://localhost:9090/?map=/etc/mapserver/polygons.map&service=wms&version=1.3.0&request=GetLegendGraphic&layer=buildings&format=image/png&SLD_VERSION=1.1.0>

!!! tip

    The names applied to the legends are based on the `CLASS` `NAME` in the Mapfile. If this is not set then no legend image is created for that layer.

<!--
## Output Image Formats

+ webp
-->

## Exercises

1. If you've read this far you deserve to discover one of MapServer's Easter eggs. Try changing the output format to `&format=image/txt`. We'll use the `polygons.map` for the request: <http://localhost:9090/?map=/etc/mapserver/polygons.map&service=wms&version=1.3.0&request=GetMap&layers=buildings&format=image/txt>
2. Create a `GetLegendGraphic` request, but for the `points.map` for the `layer=poi`.
3. Run a [GetCapabilities](http://localhost:9090/?map=/etc/mapserver/polygons.map&service=wms&version=1.3.0&request=GetCapabilities) request for the `polygons.map`. 
   Add various `METADATA` pairs listed in the [Web Object Metadata](https://mapserver.org/ogc/wms_server.html#web-object-metadata) and check its output
   in the `GetCapabilities` response.
