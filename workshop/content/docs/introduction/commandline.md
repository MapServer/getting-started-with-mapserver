# MapServer on the Command Line

You can interact with MapServer on the Docker container using the command line. Run the following commands from your system shell:

```bash
# first connect to the Docker container, and open a bash shell
docker exec -it mapserver /bin/bash
# now show the MapServer version
mapserv -v
```

This should output the MapServer version, along with other details such as PROJ and GDAL versions, and supported input and output formats:

```
MapServer version 8.4.0 PROJ version 9.5 GDAL version 3.10 OUTPUT=PNG OUTPUT=JPEG OUTPUT=KML SUPPORTS=PROJ SUPPORTS=AGG SUPPORTS=FREETYPE 
SUPPORTS=CAIRO SUPPORTS=SVG_SYMBOLS SUPPORTS=RSVG SUPPORTS=ICONV SUPPORTS=FRIBIDI SUPPORTS=WMS_SERVER SUPPORTS=WMS_CLIENT SUPPORTS=WFS_SERVER 
SUPPORTS=WFS_CLIENT SUPPORTS=WCS_SERVER SUPPORTS=SOS_SERVER SUPPORTS=OGCAPI_SERVER SUPPORTS=FASTCGI SUPPORTS=GEOS SUPPORTS=PBF INPUT=JPEG 
INPUT=POSTGIS INPUT=OGR INPUT=GDAL INPUT=SHAPEFILE INPUT=FLATGEOBUF
```

When run through a web server, data is passed to the `mapserv` application, which generates output that is then sent back through the web server.
All web requests can be recreated and tested on the command line, this makes it a handy debugging tool. 

To test a URL such as <http://localhost:7000/?map=/etc/mapserver/countries.map&mode=map> run the following command:

```bash
mapserv "QUERY_STRING=map=/etc/mapserver/countries.map&mode=map"
```

This will output a PNG image to the command line - this will look like gargabe!

We can save the output by redirecting it to a file using `>`. 
As the `mapserv` program returns responses for a web client it also returns HTTP headers. To create a valid image file we need to strip these
header by using the `-nh` (no headers) switch.

```bash
mapserv -nh "QUERY_STRING=map=/etc/mapserver/countries.map&mode=map" > /etc/mapserver/test.png
```

`test.png` should now be on your local disk at `getting-started-with-mapserver/workshop/exercises/mapfiles`.

![Test output generated at the command line](../assets/images/command-line-test.png)

!!! tip

    The `docker-compose.yml` file maps local folders to folders on the Docker container. Files created in the Docker
    container will be visible on your local disk, and files on your local disk will be visible in the container.
    This is set in in the `volumes` section, using the syntax ` - LOCAL_FOLDER:CONTAINER_FOLDER`

    ```yaml
    volumes:
      - ./scripts:/scripts
      - ./mapfiles:/etc/mapserver
    ```

We can see all command options using the `--help` switch:

```bash
mapserver --help
```

All MapServer output can be returned on the command line, not just images. For example, to see a WMS GetCapabilities XML response, run the following command:

```bash
mapserv -nh "QUERY_STRING=map=/etc/mapserver/points.map&SERVICE=WMS&REQUEST=GetCapabilities"
```

