"""
python /scripts/extents.py --mapfile "/etc/mapserver/arcgis.map"
"""

import mapscript
import argparse


def get_extent_and_center(mapfile):
    m = mapscript.mapObj(mapfile)
    extent = m.extent

    original_projection_code = m.getProjection()
    original_projection = mapscript.projectionObj(original_projection_code)

    webmercator = mapscript.projectionObj("epsg:3857")

    extent_string = f"[{extent.minx}, {extent.miny}, {extent.maxx}, {extent.maxy}]"
    print(f"Original extent {original_projection_code}: {extent_string}")

    # reprojection is done in-place
    extent.project(original_projection, webmercator)

    extent_string = f"[{extent.minx}, {extent.miny}, {extent.maxx}, {extent.maxy}]"
    print(f"New extent epsg:3857: {extent_string}")

    center = f"[{(extent.maxx + extent.minx) / 2}, {(extent.maxy + extent.miny) / 2}]"
    print(f"Center: {center}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Print map extent and center in WebMercator"
    )
    parser.add_argument("--mapfile", type=str, help="Path to the MapServer mapfile")
    args = parser.parse_args()
    get_extent_and_center(args.mapfile)
    print("Done!")