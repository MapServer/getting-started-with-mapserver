# Debugging MapServer

!!! warning

    This page is currently in a draft form.

```scala
    LAYER
        NAME "countries"
        DEBUG 5
```


    DEBUG 5
    CONFIG MS_ERRORFILE "stderr"

Then follow live logs:

```
docker logs -f mapserver
```