# Environment

## Docker compose environment

### Start
First ensure the Docker service is running, then to start Docker Compose, 
navigate to the `workshop/exercises` folder and run the following command:

```bash
# change the path below to match your setup
cd D:\GitHub\getting-started-with-mapserver\workshop\exercises
docker compose up -d
```

This will start a Docker container with MapServer (reachable from the browser at <http://localhost:9090/>), and
a Docker container with an OpenLayers development environment (reachable from the browser at <http://localhost:9091/>).

To stop, use the command:

```bash
docker compose down
```

To connect to the containers to use bash commands you can use the following commands:

```bash
docker exec -it mapserver bash
docker exec -it node bash
```

To view live logs:

```bash
docker logs --follow mapserver
```

To force getting the latest Docker images:

```bash
docker compose up -d --pull always
```