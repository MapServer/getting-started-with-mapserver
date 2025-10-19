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
            url: mapserverUrl + mapfilesPath + 'stac.map&',
            params: { 'LAYERS': 'lcpri', 'STYLES': '', VERSION: '1.1.1' }
        }),
    }),
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        projection: 'EPSG:4326',
        center: [-73.914695, 41.980675],
        zoom: 13,
    }),
});
