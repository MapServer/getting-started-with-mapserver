# Clustered Data

MapServer can combine point features together into clusters based on their location, using the [CLUSTER](https://mapserver.org/mapfile/cluster.html)
directive. 

In our example points representing trees are clustered together, with the number of points in each cluster used as the label.

<div class="map">
  <iframe src="https://mapserver.github.io/getting-started-with-mapserver-demo/clusters.html"></iframe>
</div>

## Mapfile Notes

The Mapfile contains a class for clustered features, and a class for non-clustered features. If there is no expression
  in the `CLASS` then it will be applied to all features. A feature is checked against each `CLASS` until a match is found,
  from first to last. If you want to add a "catch-all" `CLASS` then add it last in the Mapfile without an `EXPRESSION`.

```scala
# class for clustered features
CLASS
    EXPRESSION ("[Cluster_FeatureCount]" != "1")
    ...
END

# add a class for non-clustered features
CLASS
    ...
```

## Code

!!! example

    - MapServer request: <http://localhost:7000/?map=/etc/mapserver/clusters.map&mode=map&layer=trees>
    - OpenLayers example: <http://localhost:7001/clusters.html>

??? JavaScript "clusters.js"

    ``` js
    --8<-- "clusters.js"
    ```

??? Mapfile "clusters.map"

    ``` scala
    --8<-- "clusters.map"
    ```

## Exercises

1. Try changing the `MAXDISTANCE` and `REGION` parameters to see the effect this has on clustering. 

    ```scala
    CLUSTER
        MAXDISTANCE 50
        REGION "ellipse"
    END
    ```
