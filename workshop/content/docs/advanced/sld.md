# Styled Layer Descriptor (SLD) in MapServer

!!! warning

    This page is currently in a draft form.

## Overview

Styled Layer Descriptor (SLD) is an OGC standard used for describing styles. SLD files are written in XML. 

SLD can be used by MapServer in several different ways:

1. Applying an external SLD file from a URL to a WMS service
2. Using SLD in a Mapfile to style a `LAYER`.
3. Generating SLD from a Mapfile

This exercise will focus on the first use case.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/sld.html"></iframe>
</div>

## Code

!!! example

    - Direct MapServer request: <http://localhost:7000/?map=/etc/mapserver/lines.map&mode=map&layer=roads>
    - Local OpenLayers example: <http://localhost:7001/sld.html>
    - GetCapabilities request: <http://localhost:7000/?map=/etc/mapserver/sld.map&REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0>
    - Request to generate SLD from a Mapfile: <http://localhost:7000/?map=/etc/mapserver/sld.map&REQUEST=GetStyles&SERVICE=WMS&LAYERS=countries&VERSION=1.3.0&sld=http://node:7001/data/sld.xml>

???+ SLD

    ``` xml
    --8<-- "sld.xml"
    ```

??? JavaScript "sld.js"

    ``` js
    --8<-- "sld.js"
    ```

??? Mapfile "sld.map"

    ``` scala
    --8<-- "sld.map"
    ```

## Exercises

1. Update the SLD XML file. You will then need to refresh the browser to see changes.
