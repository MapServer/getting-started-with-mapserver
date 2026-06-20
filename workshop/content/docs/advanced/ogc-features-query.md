# OGCAPI Features Part 3 Filtering



Let's take a look at the [Timișoara OGC API Landing Page](http://localhost:7000/TIMISOARA/ogcapi/?f=html). This contains a link to
page listing all the supported [Conformance Classes](http://localhost:7000/TIMISOARA/ogcapi/conformance?f=html).

The three we are interested in for the tutorial are:

- http://www.opengis.net/spec/ogcapi-features-3/1.0/conf/queryables
- http://www.opengis.net/spec/ogcapi-features-3/1.0/conf/queryables-query-parameters
- http://www.opengis.net/spec/ogcapi-features-3/1.0/conf/filter

!!! note

  As this is an unreleased feature (due as part of the MapServer 8.8 release), documentation can only be seen on the [documentation preview](https://mapserver.github.io/MapServer-documentation/ogc/ogc_api.html)
  web site.



http://localhost:7000/TIMISOARA/ogcapi/collections/buildings/queryables?f=html


```
LAYER
   METADATA
      "oga_queryable_items" "CTY_NAME,CTYONLY_,LASTMOD"
          "oga_sortable_items" "name,count"

   END
END
```

Magic keyword **all**



$ mapserv -conf ../etc/mapserv.conf "PATH_INFO=/ogcapi.map/ogcapi/collections/mn_counties/queryables" "QUERY_STRING=f=json" -nh | jq .


{
  "$id": "http://localhost/cgi-bin/mapserv/OGCAPI_TEST/ogcapi/collections/mn_counties/queryables",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": false,
  "description": "This is the standard Minnesota State County Boundary dataset.",
  "properties": {
    "CTYONLY_": {
      "description": "Queryable item 'CTYONLY_'",
      "type": "integer"
    },
    "Name": {
      "description": "Queryable item 'Name'",
      "type": "string"
    },
    "LASTMOD": {
      "description": "Queryable item 'LASTMOD'",
      "format": "date-time",
      "type": "string"
    }
  },
  "title": "State of Minnesota County Boundaries",
  "type": "object"
}

$ mapserv -conf ../etc/mapserv.conf "PATH_INFO=/ogcapi.map/ogcapi/collections/mn_counties/items" "QUERY_STRING=f=json&Name=Rice"

Now let's make some queries!

http://localhost:7000/TIMISOARA/ogcapi/collections/buildings/items?f=json&building=hospital



const cqlFilter = "date_field LIKE '2025_08%'";

const url = `https://example.com/ogcapi/collections/myLayer/items?` +
    `filter=${encodeURIComponent(cqlFilter)}&filter-lang=cql2-text&limit=1000`;



Excercises

- Add a new buildings type to the dropdown

Check the performance of "ows_use_default_extent_for_getfeature" "false"
