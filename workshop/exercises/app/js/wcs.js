import '../css/style.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;
const url = mapserverUrl + mapfilesPath + 'wcs.map';

const wcsSource = new ImageWMS({
    url,
    params: {
        SERVICE: 'WCS',
        VERSION: '2.0.1',
        REQUEST: 'GetCoverage',
        FORMAT: 'image/png',
        COVERAGEID: 'dtm',
        SUBSETTINGCRS: 'http://www.opengis.net/def/crs/EPSG/0/3857',
        OUTPUTCRS: 'http://www.opengis.net/def/crs/EPSG/0/3857',
    },
    projection: 'EPSG:3857',
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

const map = new Map({
    target: 'map',
    layers: [
        new ImageLayer({
            source: wcsSource
        }),
    ],
    view: new View({
        projection: 'EPSG:3857',
        center: [2975862, 8046369],
        zoom: 14,
    }),
});

// apply CSS filters to enhance the contrast in the DTM
map.once('rendercomplete', () => {
    document.querySelector('.ol-layer canvas').style.filter =
        'brightness(2.2) contrast(2) sepia(1) hue-rotate(90deg) saturate(3)';
});