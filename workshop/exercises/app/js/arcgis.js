import '../css/style.css';
import ImageWMS from 'ol/source/ImageWMS.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer.js';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;

const imageLayer = new ImageLayer({
    source: new ImageWMS({
        url: mapserverUrl + mapfilesPath + 'arcgis.map&',
        params: { 'LAYERS': 'PoolPermits', 'STYLES': '', LABELS: 'hidden' }
    }),
});
const layers = [
    new TileLayer({
        source: new OSM(),
        opacity: 0.2,
        className: 'bw'
    }),
    imageLayer
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [-13074410.5, 4015820],
        zoom: 17,
    }),
});

const labelsCheckbox = document.getElementById('labelsCheckbox');
labelsCheckbox.addEventListener('change', (event) => {
    const showLabels = event.target.checked ? 'visible' : 'hidden';
    // update the WMS parameters
    imageLayer.getSource().updateParams({ LABELS: showLabels });

    // refresh the layer
    imageLayer.getSource().refresh();
});