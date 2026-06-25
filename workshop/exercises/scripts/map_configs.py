r"""
C:\VirtualEnvs\mappyfile3\Scripts\Activate.ps1
cd D:\GitHub\getting-started-with-mapserver
python ./workshop/exercises/scripts/map_configs.py
"""

import mappyfile
import json
from pathlib import Path

fn = r"./workshop/exercises/mapfiles/mapserver.conf"
d = mappyfile.open(fn, include_comments=True)

maps = {} # d["maps"]

# get .MAP files

map_files = [p for p in Path("./workshop/exercises/mapfiles").glob("*.map")]

for mf in sorted(map_files):
    maps[mf.stem.upper()] = f"/etc/mapserver/{mf.name}"

d["maps"] = maps

print(mappyfile.dumps(d, indent=4))
