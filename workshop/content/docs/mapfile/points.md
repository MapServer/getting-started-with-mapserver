# A Point Map

## Overview

In this exercise we'll create a map of POIs (Points of Interest) from OpenStreetMap for Mostar, Bosnia-Herzegovina - the host
city for [FOSS4G Europe 2025](https://2025.europe.foss4g.org/).

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/points.html"></iframe>
</div>

The diagram below shows the Mapfile directives used for the point map:

![Mapfile classes used in the Points map](../assets/images/point-map-classes.png "Mapfile Classes")

## Symbols

The Mapfile symbolises the points using different [SYMBOLs](https://mapserver.org/mapfile/symbol.html). There are several different symbol [TYPEs](https://mapserver.org/mapfile/symbol.html#mapfile-symbol-type) available in MapServer.

A simple circle symbol is defined in the Mapfile as follows:

```scala
SYMBOL
    NAME "circle"
    TYPE ELLIPSE
    FILLED TRUE
    POINTS
        1 1
    END
END
```

A symbol can also reference a character in a font file using `TYPE TRUETYPE`. References to different font files are added to a [FONTSET](https://mapserver.org/mapfile/fontset.html).

## Fonts

A `FONTSET` includes an alias for the name of the font, and the path to the font file itself. This workshop uses the following `fontset.txt` file (found in `workshop/exercises/mapfiles/data/fonts/fontset.txt`):

```
# Alias                # Font file
MaterialIcons          MaterialIcons-Regular.ttf
MaterialIconsRound     MaterialIconsRound-Regular.otf
LiberationMono         LiberationMono-Regular.ttf
LiberationSans         LiberationSans-Regular.ttf
```

In the Mapfile itself we then reference this file and use any of the font aliases for symbols and labels. 

In the example below we're using a
cinema character from Google's [Material Symbols](https://fonts.google.com/icons).
We use HTML entity number of the symbol we want in the [CHARACTER](https://mapserver.org/mapfile/symbol.html#mapfile-symbol-character) keyword.
A list of these codes and their associated symbols can be seen at [http://localhost:7001/fonts.html](http://localhost:7001/fonts.html).

```scala
FONTSET "data/fonts/fontset.txt"
SYMBOL
    NAME "cinema"
    TYPE TRUETYPE
    FONT "MaterialIcons"
    CHARACTER "&#57388;"
END
```

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/points.map&mode=map&layer=pois>
    - Local OpenLayers example: <http://localhost:7001/points.html>

??? JavaScript "points.js"

    ``` js
    --8<-- "points.js"
    ```

??? Mapfile "points.map"

    ``` scala
    --8<-- "points.map"
    ```

## Exercises

1. Edit the `workshop/exercises/app/js/points.js` to show the OpenStreetMap base layer. You need to set the `visible: false` to `visible: true`.
2. Change the default `CLASS` to use larger points in a more visible colour.
3. Add another class to display another point type. Choose an appropriate symbol from the list at <http://localhost:7001/fonts.html>. Some example attribute types include `fast_food`, `monument`, and `post_box`. The source dataset is `workshop/exercises/mapfiles/data/osm/pois.fgb` - this can be opened in QGIS to view all available attributes and values. 

<!--

If a symbol name doesn't exist:

msDrawMap(): Image handling error. Failed to draw layer named 'pois'. msLoadMSRasterBufferFromFile(): General error message. unable to open file /etc/mapserver/new for reading

E.g.

    STYLE
        SYMBOL "new"
        SIZE 50
        COLOR 0 0 0
    END

A symbol can also point to a SVG image file on disk as in the example below:

```scala
SYMBOL
    NAME "city-hall"
    TYPE SVG
    IMAGE "data/icons/city-hall.svg"
END
```

#### Possible Errors

If SVG symbols are not appearing, ensure they have a width and height set. You can view the contents of an SVG file in a text editor.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 50 50">
    <path fill="currentColor" d="M7.743 21.8h3.485v22.4h5.229V25h5.229v19.2h5.228...
</svg>
```
-->
