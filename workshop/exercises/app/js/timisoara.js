import '../css/style.css';
import ImageWMS from 'ol/source/ImageWMS.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Style, Stroke } from 'ol/style.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;
const baseUrl = mapserverUrl.replace(/\?+$/, '');

function buildOgcUrl(buildingType) {
    const cqlFilter = `building='${buildingType}'`;
    return `${baseUrl}/timisoara/ogcapi/collections/buildings/items?` +
        `filter=${encodeURIComponent(cqlFilter)}&filter-lang=cql2-text&limit=1000&f=json`;
}

const select = document.getElementById('building-select');

const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: buildOgcUrl(select.value),
    strategy: allStrategy,
});

const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: [
        new Style({
            stroke: new Stroke({ color: 'rgba(0,0,0,0.5)', width: 5 }),
        }),
        new Style({
            stroke: new Stroke({ color: 'cyan', width: 3 }),
        }),
    ]
});

const layers = [
    new TileLayer({
        source: new OSM(),
        visible: false,
    }),
    new ImageLayer({
        opacity: 0.2,
        source: new ImageWMS({
            url: mapserverUrl + mapfilesPath + 'timisoara.map&',
            params: { 'LAYERS': 'buildings', 'STYLES': '' },
        }),
    }),
    vectorLayer,
];

const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [2363111, 5740066],
        zoom: 16,
    }),
});

document.getElementById('building-select').addEventListener('change', (e) => {
    const newSource = new VectorSource({
        format: new GeoJSON(),
        url: buildOgcUrl(e.target.value),
        strategy: allStrategy,
    });
    vectorLayer.setSource(newSource);
});

const loadingMask = document.getElementById('loading-mask');
map.on('loadstart', () => loadingMask.classList.add('active'));
map.on('loadend', () => loadingMask.classList.remove('active'));