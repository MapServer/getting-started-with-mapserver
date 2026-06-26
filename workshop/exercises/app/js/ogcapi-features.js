import '../css/style.css';
import VectorSource from 'ol/source/Vector.js';
import Map from 'ol/Map.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer.js';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_OGC_BASE_URL;

const layers = [
    new TileLayer({
        source: new OSM(),
    }),
    new VectorLayer({
        style: {
            'fill-color': 'rgba(255, 255, 0, 0.7)',
            'stroke-width': 1.3,
        },
        source: new VectorSource({
            url: mapserverUrl + 'ogcapi-features/ogcapi/collections/pois_polygon/items?f=json&limit=500',
            format: new GeoJSON(),
        }),
    }),
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [1982884, 5363834],
        zoom: 13,
    }),
});
