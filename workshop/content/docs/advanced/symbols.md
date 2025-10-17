# Vector Symbols

## Overview

In this exercise we'll look at how [SYMBOL](https://mapserver.org/mapfile/symbol.html)s can be used to apply complex cartographic effects to vector data. The Mapfile displays OpenStreetMap railways in Tartu, Estonia.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/railways.html"></iframe>
</div>

## Vector Symbols

We've looked at `ELLIPSE`, and `TRUETYPE` symbols in the [Points Styling](../mapfile/points.md) exercise. In this example 
we'll be looking at [Vector Symbols](https://mapserver.org/mapfile/symbology/construction.html#symbols-of-type-vector-and-ellipse) - which
use vector drawings to define the shape of a symbol.

First you define the [SYMBOL](https://mapserver.org/mapfile/symbol.html)s - either be directly in the Mapfile,
or in a separate [SYMBOLSET](https://mapserver.org/mapfile/map.html#symbolset) file. The advantage of using a separate file is that you
can share symbols between maps. A minor disadvantage is we need to deploy an extra file, and ensure the Mapfile has the correct path
to the `SYMBOLSET` - this can be a full path or relative to the Mapfile.

In this example as we only have two symbols we will add them directly to the Mapfile. 
First we define the symbols. We'll start with a simple vertical line, by defining `POINTS` as x,y coordinates:

```scala
SYMBOL
    NAME "vertline" # we can use this to reference the SYMBOL in STYLEs
    TYPE VECTOR
    FILLED FALSE # the symbol will be treated as a LINE
    POINTS
        0 0
        0 10
    END
END
```

Next we'll create a simple square symbol:

```scala
SYMBOL
    NAME "square"
    TYPE VECTOR
    FILLED TRUE # the symbol will be treated as a POLYGON
    POINTS
        0 0
        0 10
        10 10
        10 0
    END
END
```

Now we can refer to these symbols by their `NAME`s in a `STYLE` definitions.
As out `vertline` symbol has `FILLED` is set to `FALSE` the symbol is treated as a line rather than a polygon. This means a `WIDTH`
can be set on the `STYLE` to change the width of the symbol.

A [GAP](https://mapserver.org/mapfile/style.html#mapfile-style-gap) is added to the style. The value specifies the distance of the centre of
one `vertline` symbol to the next. The negative value renders the symbols relative to the tangent of the line - without this the lines will be displayed
vertically, whereas we want them to cross the underlying line.

```scala
STYLE
    COLOR 102 102 102
    SYMBOL "vertline"
    WIDTH 0.4
    GAP -50
END
```

We'll use the `square` symbol to represent stations and stops. We can apply a `SIZE` and `COLOR` to the symbol:

```scala
STYLE
    SYMBOL "square"
    SIZE 16
    COLOR 102 102 102
END
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/railways.map&mode=map&layer=roads>
    - Local OpenLayers example: <http://localhost:7001/railways.html>

??? JavaScript "railways.js"

    ``` js
    --8<-- "railways.js"
    ```

??? Mapfile "railways.map"

    ``` scala
    --8<-- "railways.map"
    ```

## Exercises

1. Try experimenting with the `GAP` values to see how this affects the output.

    ```scala
    STYLE
        COLOR 102 102 102
        SYMBOL "vertline"
        WIDTH 0.4
        GAP -50
    END
    ```

2. Change the square symbol used for stations into a different shape such as a triangle.

## Further Reading

- [Cartographical Symbol Construction with MapServer](https://mapserver.org/mapfile/symbology/construction.html)
- [MapServer Symbology Exchange](https://github.com/MapServer/MapServer/wiki/SymbologyExchangeVector)
