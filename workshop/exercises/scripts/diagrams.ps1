cd D:\GitHub\getting-started-with-mapserver
pip install gdalgviz
$GVIZ_PATH = "C:\Program Files\Graphviz\bin"
$env:PATH = "$GVIZ_PATH;$env:PATH"
gdalgviz ./workshop/exercises/mapfiles/data/raster/clipped.gdalg.json ./workshop/content/docs/assets/images/clipped.gdalg.svg --header-color "#33A333" --node-attr "fontsize=14,fontname=Arial" --graph-attr "bgcolor=transparent,pad=0.5"
gdalgviz ./workshop/exercises/mapfiles/data/osm/roads.gdalg.json ./workshop/content/docs/assets/images/roads.gdalg.svg --header-color "#33A333" --node-attr "fontsize=14,fontname=Arial" --graph-attr "bgcolor=transparent,pad=0.5"
