import '../css/style.css';
import ImageWMS from 'ol/source/ImageWMS.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer.js';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;

const layers = [
    new TileLayer({
        source: new OSM(),
    }),
    new ImageLayer({
        extent: [-1136368.0, 6840385.0, -1131379.0, 6843727.0],
        source: new ImageWMS({
            url: mapserverUrl + mapfilesPath + 'direction.map&',
            // can also add a raster layer
            params: { 'LAYERS': 'flow', 'STYLES': '' },
            ratio: 1
        }),
    }),
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [-1133873.5, 6842056.0],
        zoom: 14,
    }),
});

