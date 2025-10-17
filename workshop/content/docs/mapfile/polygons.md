# Polygon Styling

## Overview

This exercise displays buildings from OpenStreetMap. 

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/polygons.html"></iframe>
</div>

## Polygons

The buildings are a polygon dataset, so we set our `LAYER TYPE` to `POLYGON`:

```scala
LAYER
    NAME "buildings"
    TYPE POLYGON
    ...
```

When styling polygons we can set the colour of the polygon, and also its outline color:

```scala
CLASS
    ...
    STYLE
        COLOR 246 241 223
        OUTLINECOLOR 0 0 0
    END
END
```

## Expressions

In this Mapfile we have two different classes for the dataset.

The first class has an [EXPRESSION](https://mapserver.org/mapfile/expressions.htm) that limits 
which features will be drawn. This compares the value for the "type" field for each feature with "university".
If there is a match then the feature is drawn with the `STYLE`s from the `CLASS`.

```scala
CLASS
    GROUP "university"
    EXPRESSION ( "[type]" = "university" )
...
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/polygons.map&mode=map&layer=buildings>
    - Local OpenLayers example: <http://localhost:7001/polygons.html>

!!! tip

    A LAYER has a [CONNECTIONTYPE](https://mapserver.org/mapfile/layer.html#mapfile-layer-connectiontype)
    that is used to connect to different data sources. The connection types are "native" -
    when the reading of the data is handled by MapServer code. The OGR connection type uses GDAL/OGR
    to read data sources. For some data types, as in the flatgeobuf example used here, there is an option
    to use either a native connection or an OGR connection.

    There is also a PLUGIN connection type to allow connections to MS SQL Server and Oracle databases.


    ```scala
    CONNECTIONTYPE OGR
    # CONNECTIONTYPE FLATGEOBUF
    # DATA "data/osm/buildings_a.fgb"
    CONNECTION "data/osm/buildings_a.fgb"
    ```

??? JavaScript "polygons.js"

    ```js
    --8<-- "polygons.js"
    ```

??? Mapfile "polygons.map"

    ``` scala
    --8<-- "polygons.map"
    ```

## Exercises

1. Switch the `CLASSGROUP` in the Mapfile to see different styles. There are two groups `university` and `other`.

    ```scala
    LAYER
        NAME "buildings"
        ...
        CLASSGROUP "university" # can switch the default set of CLASSes here
    ```

2. Switch the style used in the `polygon.js` file from `university` to `other`:

    ```js
    source: new ImageWMS({
        url: mapserverUrl + mapfilesPath + 'polygons.map&',
        params: { 'LAYERS': 'buildings', 'STYLES': 'other' },
    ```

3. Switch the `CONNECTIONTYPE` to use the native `FLATGEOBUF` driver.

4. Experiment with styling the polygons. `WIDTH` can be used to change the width of the polygon outline. There are more examples
   at [Cartographical Symbol Construction with MapServer](https://mapserver.org/mapfile/symbology/construction.html).
