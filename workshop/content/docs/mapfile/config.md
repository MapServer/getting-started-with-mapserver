# MapServer Configuration File

The MapServer 8.0 release saw the introduction of a global [CONFIG](https://mapserver.org/mapfile/config.html) file. This allowed
adding settings that apply to all Mapfiles in a MapServer deployment, avoiding duplication and making configuration more straight forward.

This tutorial provides an introduction to the `CONFIG` file, and highhlights 


## Overview


Set this in the config file
    MS_ONLINERESOURCE "/"


    Include the one used by the workshop

Any changes in the CONFIG file you need to restart the web server:

```bash
docker restart mapserver
```