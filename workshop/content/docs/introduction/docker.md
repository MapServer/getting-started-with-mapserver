# Docker

We will be using MapServer on a Docker image for the workshop. This ensures that the MapServer version and the Apache web server configuration are identical.

## Docker MapServer

The MapServer Docker image is provided by [Camptocamp](https://github.com/camptocamp/docker-mapserver), and the Dockerfile is found [here](https://github.com/camptocamp/docker-mapserver/blob/master/Dockerfile). 

MapServer runs on the Apache web server - see the [Apache page](../advanced/apache.md) page for further details. 

It uses the Apache [mod_fcgid module](https://httpd.apache.org/mod_fcgid/), module that provides FastCGI support.

MapServer runs on port 80 on the Docker container, which is mapped to port 7000 on the local machine, as can be seen in the Docker compose file
located at `workshop\exercises\docker-compose.yml`:

```yaml
  mapserver:
    image: geographika/mapserver-workshop:latest
    container_name: mapserver
    ports:
      - 7000:80
    environment:
      MAPSERVER_CONFIG_FILE: "/etc/mapserver/mapserver.conf"
    volumes:
      - ./scripts:/scripts
      - ./mapfiles:/etc/mapserver
    networks:
      - mynetwork
```

## JavaScript Application

A second container that serves the JavaScript example pages is also run using Docker. This uses node and runs on port 7001 on both the container and the host machine.

```yaml
  node:
    image: node:lts-slim
    container_name: node
    ports:
      - 7001:7001
    working_dir: /home/node/app
    volumes:
      - ./app:/home/node/app
    networks:
      - mynetwork
    command: >
      sh -c "npm install && npm start"
```

## Stopping and Starting Docker

```bash

  cd ./getting-started-with-mapserver/workshop/exercises
  # start docker in detached mode
  docker compose up -d
  # the following URLs should now be available
  # http://localhost:7000
  # http://localhost:7001

  # stop docker
  docker compose down

  # for help
  docker compose help
  # for a specific command
  docker compose up --help
```


## Removing a Container

```bash
# to remove a container named db
docker rm db
```
