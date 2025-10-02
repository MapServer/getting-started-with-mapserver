# Creating the Docker Image

```
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"
cd C:\GitHub\getting-started-with-mapserver\docker

docker build `
    --tag "mapserver-workshop" `
    --target=runner `
    --build-arg=MAPSERVER_BRANCH=main `
    --build-arg=MAPSERVER_REPO=https://github.com/mapserver/mapserver `
    .

docker run -it --name mapserver-workshop -p 8080:8080 mapserver-workshop

docker tag mapserver-workshop geographika/mapserver-workshop

docker login
# geographika
# docker images
docker push geographika/mapserver-workshop
```

## Testing

```
docker start mapserver-workshop
docker exec -it mapserver-workshop bash
```
