# GDAL Raster Pipeline

!!! warning

    This page is currently in a draft form.


```
gdal raster info data/raster/clipped.tif

gdal raster info data/raster/clipped.gdalg.json


gdal raster pipeline ! read /etc/mapserver/data/raster/clipped.tif ! color-map --color-map /etc/mapserver/data/raster/color-map-percentage.txt ! blend --operator=hsv-value --overlay [ read /etc/mapserver/data/raster/clipped.tif ! hillshade -z 30 ] ! write /etc/mapserver/data/raster/tmp.tif --overwrite

```