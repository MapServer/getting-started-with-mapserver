import '../css/style.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { addProjection } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox } from 'ol/loadingstrategy';
import { Style, Stroke, Fill } from 'ol/style';
import ImageWMS from 'ol/source/ImageWMS';
import { Circle as CircleStyle } from 'ol/style';
import ImageCanvas from 'ol/source/ImageCanvas';
import Graticule from 'ol/layer/Graticule';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;
const url = mapserverUrl + mapfilesPath + 'other-projections.map';

proj4.defs('ESRI:53009',
    '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs'
);
register(proj4);

const coverageExtent = [-18019909, -9009954, 18019909, 9009954];

const mollweideProjection = new Projection({
    code: 'ESRI:53009',
    units: 'm',
    extent: coverageExtent,
    worldExtent: [-180, -90, 180, 90],
    global: true,
});

addProjection(mollweideProjection);

const wcsSource = new ImageWMS({
    url,
    params: {
        SERVICE: 'WCS',
        VERSION: '2.0.1',
        REQUEST: 'GetCoverage',
        FORMAT: 'image/png',
        COVERAGEID: 'raster',
        SUBSETTINGCRS: 'http://www.opengis.net/def/crs/ESRI/0/53009',
        OUTPUTCRS: 'http://www.opengis.net/def/crs/ESRI/0/53009',
    },
    imageLoadFunction: (image, src) => {
        const srcUrl = new URL(src);
        const params = srcUrl.searchParams;

        // Get the ImageWMS params
        const bbox = params.get('BBOX').split(',');
        const width = params.get('WIDTH');
        const height = params.get('HEIGHT');

        // Replace with WCS 2.0.1 equivalents
        params.append('SUBSET', `x(${bbox[0]},${bbox[2]})`);
        params.append('SUBSET', `y(${bbox[1]},${bbox[3]})`);
        params.set('SCALESIZE', `x(${width}),y(${height})`);

        // Remove the WMS params
        params.delete('BBOX');
        params.delete('WIDTH');
        params.delete('HEIGHT');
        params.delete('CRS');

        image.getImage().src = srcUrl.toString();
    },
    ratio: 1,
});

const imageLayer = new ImageLayer({
    source: wcsSource
});

const wmsLayer = new ImageLayer({
    source: new ImageWMS({
        url: url,
        params: {
            LAYERS: 'countries',
            FORMAT: 'image/png',
            TRANSPARENT: true,
            VERSION: '1.3.0',
        },
        serverType: 'mapserver',
    }),
});

// https://openlayers.org/en/latest/examples/graticule.html
const graticule = new Graticule({
    strokeStyle: new Stroke({
        color: 'rgba(50,50,50,0.5)',
        width: 1,
    }),
    showLabels: true,
    wrapX: false
});

const wfsSource = new VectorSource({
    format: new GeoJSON({
        dataProjection: 'ESRI:53009',
    }),
    url: function (extent) {
        const [minx, miny, maxx, maxy] = extent;
        return `${url}&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature` +
            `&TYPENAMES=ms:cities` +
            `&OUTPUTFORMAT=geojson` +
            `&SRSNAME=ESRI:53009` +
            `&BBOX=${minx},${miny},${maxx},${maxy}`;
    },
    strategy: bbox,
});

const wfsLayer = new VectorLayer({
    source: wfsSource,
    style: new Style({
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: '#ff6600' }),
            stroke: new Stroke({ color: '#ffffff', width: 1 }),
        }),
    }),
});

const map = new Map({
    target: 'map',
    layers: [imageLayer, wmsLayer, graticule, wfsLayer],
    view: new View({
        projection: 'ESRI:53009',
        center: [0, 0],
        zoom: 1,
    }),
});
