# MapServer and Apache

!!! warning

    This page is currently in a draft form.
    
## Overview

The Apache web server is used by the workshop Docker image. Since version 8.0 MapServer has a global config file.

At its heart MapServer is a command-line application that can be accessed through a web server.

Apache has a [configuration file](https://github.com/MapServer/getting-started-with-mapserver/blob/main/docker/runtime/etc/apache2/conf-enabled/mapserver.conf).
The Docker image uses a [start-up script(https://github.com/MapServer/getting-started-with-mapserver/blob/main/docker/runtime/usr/local/bin/start-server).

MapServer uses the [mod_fcgid module](https://httpd.apache.org/mod_fcgid/), which is an Apache module that provides FastCGI support.

```
FcgidMaxRequestsPerProcess ${MAX_REQUESTS_PER_PROCESS}
FcgidMinProcessesPerClass ${MIN_PROCESSES}
FcgidMaxProcessesPerClass ${MAX_PROCESSES}
FcgidBusyTimeout ${BUSY_TIMEOUT}
FcgidIdleTimeout ${IDLE_TIMEOUT}
FcgidIOTimeout ${IO_TIMEOUT}
```

These are all documented on the [reference page(https://httpd.apache.org/mod_fcgid/mod/mod_fcgid.html).

These all have defaults in the Docker file, but can be overridden using environment variables.

```
ENV MS_DEBUGLEVEL=0 \
    MS_ERRORFILE=stderr \
    MAPSERVER_CONFIG_FILE=/etc/mapserver.conf \
    MAPSERVER_BASE_PATH= \
    MAX_REQUESTS_PER_PROCESS=1000 \
    MIN_PROCESSES=1 \
    MAX_PROCESSES=5 \
    BUSY_TIMEOUT=300 \
    IDLE_TIMEOUT=300 \
```


All requests to the server are mapped to [mapserv_wrapper](https://github.com/MapServer/getting-started-with-mapserver/blob/main/docker/runtime/usr/local/bin/mapserv_wrapper) - a small wrapper script. 

```
ScriptAliasMatch "^${MAPSERVER_BASE_PATH}/(.*)" /usr/local/bin/mapserv_wrapper/$1
ScriptAliasMatch "^${MAPSERVER_BASE_PATH}" /usr/local/bin/mapserv_wrapper
```

Restarting Apache:

```bash
docker restart mapserver
```

## Other Web Servers

* [IIS](https://mapserver.org/installation/iis.html)
