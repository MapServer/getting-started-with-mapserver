# Overview

This folder contains details on how to build the Docker images used for the workshop.
Workshop attendees don't need to build these images themselves, they can simply use the built images.


## Creating the Docker Image

```
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# can also test other repos / branches

cd D:\GitHub\getting-started-with-mapserver\docker

# MAPSERVER_BRANCH=main
# MAPSERVER_BRANCH=branch-8-6

# add --no-cache to the command below to force getting the latest code
# it could be months old otherwise!

docker build `
    --tag "mapserver-workshop" `
    --target=runner `
    --build-arg=MAPSERVER_BRANCH=main `
    --build-arg=MAPSERVER_REPO=https://github.com/mapserver/mapserver `
    --no-cache `
    .

# push the image for use in docker-compose and for workshop attendees to pull from DockerHub
# https://mapserver.github.io/getting-started-with-mapserver-demo/ builds from this image
# and needs to be updated if the image is rebuilt with a new MapServer version or branch
# by pushing mapserver-workshop-demo (see below)
docker tag mapserver-workshop geographika/mapserver-workshop
# docker login
# geographika
# docker images
docker push geographika/mapserver-workshop
```

If there are connection issues, try running the following test from the host, and check proxy/DNS settings:

```
ping archive.ubuntu.com
```

Also check https://status.canonical.com/

## Testing

```
docker pull geographika/mapserver-workshop:latest
# docker stop mapserver-workshop
# docker rm mapserver-workshop
docker run -it --name mapserver-workshop geographika/mapserver-workshop:latest bash
# mapserv -v
# docker start mapserver-workshop
# docker exec -it mapserver-workshop bash
```

## Build the Demo Image

This image contains both MapServer (based on the image above) and all the MapServer workshop files so it can be deployed
in the cloud. This is not required for the workshop itself, and users will use local files from the repository.

The URL for the deployed MapServer is currently https://mapserver-workshop-k8hvw.ondigitalocean.app/
and is used for the online demo at https://mapserver.github.io/getting-started-with-mapserver-demo/

It first requires the `mapserver-workshop` Docker image above is built and available locally.

```
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"
# note parent path
cd D:\GitHub\getting-started-with-mapserver

docker build -f docker/Dockerfile.demo `
    --tag "mapserver-workshop-demo" `
    .

docker tag mapserver-workshop-demo geographika/mapserver-workshop-demo

# docker login
# geographika
# docker push geographika/mapserver-workshop-demo

# DigitalOcean
# https://mapserver-workshop-k8hvw.ondigitalocean.app/
# used for https://mapserver.github.io/getting-started-with-mapserver-demo/
# Login and get a new API token with permissions for "registry"
# https://cloud.digitalocean.com/account/api/tokens

doctl auth init -t dop_v1_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
doctl registry login
docker tag mapserver-workshop-demo registry.digitalocean.com/geographika/mapserver-workshop-demo:latest
docker push registry.digitalocean.com/geographika/mapserver-workshop-demo:latest
doctl registry repository list-tags mapserver-workshop-demo
```

To test demo locally:
```
docker run -it --rm --name mapserver-workshop-demo -p 8080:8080 mapserver-workshop-demo
# http://localhost:8080/
```