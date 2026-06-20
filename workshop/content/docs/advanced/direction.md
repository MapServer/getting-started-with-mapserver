

```bash
docker exec -it mapserver /bin/bash
map2img -m direction.map -o direction.png

map2img -m direction.map -e -1133569.01 6841714.56 -1133466.97 6841780.95 -l "raster flow" -o direction.png
```
