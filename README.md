# Getting Started with MapServer

Welcome to the Getting Started with MapServer workshop!

[MapServer](https://mapserver.org/) is an Open Source platform for publishing spatial data and interactive mapping applications to the web. 
Originally developed in the mid-1990’s at the University of Minnesota, MapServer is released under an MIT-style license, and runs on all 
major platforms (Windows, Linux, Mac OS X). 

## For users

Are you a workshop participant or want to dive-in individually?  Go to 
[https://mapserver.github.io/getting-started-with-mapserver](https://mapserver.github.io/getting-started-with-mapserver) 
to follow the lessons and exercises.

The demo exercises are also available online at
[https://mapserver.github.io/getting-started-with-mapserver-demo/](https://mapserver.github.io/getting-started-with-mapserver-demo/).

## For authors

Below are guidelines for authoring and/or improving the workshop's content.

### Setting up the MapServer environment

This workshop uses Docker (Docker, Docker Compose) to ensure a consistent environment
to deploy MapServer and work through the various exercises. As with participants, follow
the [Workshop environment setup](https://mapserver.github.io/getting-started-with-mapserver/setup).

### Building the workshop content locally

The workshop manual is powered by [MkDocs](https://www.mkdocs.org) which facilitates easy management
of content and publishing. Workshop content is written in Markdown.


### Setting up the manual environment locally

```bash
# build a virtual Python environment in isolation
python3 -m venv .
. bin/activate
# fork or clone from GitHub
git clone https://github.com/mapserver/getting-started-with-mapserver.git
cd getting-started-with-mapserver/workshop/content
# install required dependencies
pip install -r requirements.txt
# build the website
mkdocs build
# serve locally
mkdocs serve  # website is made available on http://localhost:8000
```

## Contributing updates

To make contributions back to the workshop, fork the repository from GitHub.  Contributions and Pull Requests are always welcome!

Changes to the GitHub repository result in an automated build and deploy of the content to [https://mapserver.github.io/getting-started-with-mapserver](https://mapserver.github.io/getting-started-with-mapserver).

## Deploying to live site

Website updates are automatically published via GitHub Actions. To publish manually:

```bash
# NOTE: you require access privileges to the GitHub repository
# to publish live updates
mkdocs gh-deploy -m 'add new page on topic x'
```
