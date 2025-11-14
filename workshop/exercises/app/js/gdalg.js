import '../css/style.css';
import ImageWMS from 'ol/source/ImageWMS.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Image as ImageLayer } from 'ol/layer.js';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;

const layers = [
    new ImageLayer({
        source: new ImageWMS({
            url: mapserverUrl + mapfilesPath + 'gdalg.map&',
            params: { 'LAYERS': 'buffered_roads,roads' },
            ratio: 1
        }),
    }),
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [2975862.75916499, 8046369.8646329],
        zoom: 17,
    }),
});
