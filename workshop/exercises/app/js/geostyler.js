import '../css/geostyler.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import SLDParser from 'geostyler-sld-parser';
import OpenLayersParser from 'geostyler-openlayers-parser';
import xmlFormat from 'xml-formatter';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { xml } from '@codemirror/lang-xml';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;

const serverUrl = `${mapserverUrl}${mapfilesPath}geostyler.map&`;
const includesUrl = `${import.meta.env.BASE_URL}includes/`;

/**
 * Layers available in the demo.
 *
 * - id: the MapServer LAYER name.
 * - type: the geometry type, shown in the layer selector
 * - title (optional): label in the layer selector
 */
const demoLayers = [
    { id: 'arrow-wide', type: 'line' },
    { id: 'notched-rect', type: 'point' },
    { id: 'square-spaced', type: 'polygon' },
    { id: 'wave', type: 'polygon' },
];

const sldParser = new SLDParser();
const olParser = new OpenLayersParser();

const baseLayer = () => new TileLayer({ source: new OSM(), opacity: 0.5, className: 'bw' });

const sharedView = new View({
    center: [2975862, 8046369],
    zoom: 14,
});

// TODO add Mapfile syntax
const mapfileLanguage = [];

/**
 * Read-only code viewer with line numbers, folding and search (Ctrl+F)
 */
function createViewer(parentId, language) {
    return new EditorView({
        parent: document.getElementById(parentId),
        state: EditorState.create({
            extensions: [
                basicSetup,
                language,
                EditorState.readOnly.of(true),
                EditorView.editable.of(false),
            ],
        }),
    });
}

function setText(view, text) {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
}

const classView = createViewer('class-text', mapfileLanguage);
const symView = createViewer('sym-text', mapfileLanguage);
const sldView = createViewer('sld-text', xml());

function showSld(text) {
    let formatted = text;
    try {
        formatted = xmlFormat(text, { indentation: '  ', collapseContent: true });
    } catch {
        // not XML (e.g. an error message): show as is
    }
    setText(sldView, formatted);
}

async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.text();
}

/**
 * Fetch a file that may not exist. Returns null if it is missing.
 * The Vite dev server answers unknown paths with index.html (status 200),
 * so an HTML response is also treated as missing.
 */
async function fetchOptionalText(url) {
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok || contentType.includes('text/html')) {
        return null;
    }
    return response.text();
}

/**
 * Fetch the SLD for a layer with a GetStyles request, and return it as a string.
 */
async function fetchSld(layerConfig) {
    const sldUrl = `${serverUrl}REQUEST=GetStyles&SERVICE=WMS&VERSION=1.3.0&LAYERS=${layerConfig.id}`;
    const response = await fetch(sldUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch SLD: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('xml')) {
        throw new Error(`Unexpected Content-Type: ${contentType}. Expected XML.`);
    }

    return response.text();
}

/**
 * Convert an SLD to an OpenLayers style with GeoStyler, and apply it.
 */
async function applySld(sldXmlString, vectorLayer) {
    const gs = await sldParser.readStyle(sldXmlString);
    if (gs.errors) {
        throw new Error(`Errors parsing the SLD: ${gs.errors}`);
    }

    // MapServer applies the first matching CLASS, so a final CLASS without an
    // EXPRESSION means "everything else". In SLD a rule without a filter
    // matches every feature, so mark such rules as else rules.
    const rules = gs.output.rules;
    if (rules.some((r) => r.filter)) {
        rules.filter((r) => !r.filter).forEach((r) => { r.elseRule = true; });
    }
    console.log(`GeoStyler style for layer ${vectorLayer.get('name')}:`, gs.output);

    const ol = await olParser.writeStyle(gs.output);

    if (ol.errors) {
        throw new Error(`Errors writing the OpenLayers style: ${ol.errors}`);
    }
    console.log(`OpenLayers style for layer ${vectorLayer.get('name')}:`, ol.output);

    vectorLayer.setStyle(ol.output);
}

function createVectorLayer(layerConfig) {
    const source = new VectorSource({
        format: new GeoJSON({
            dataProjection: 'EPSG:3857',
            featureProjection: 'EPSG:3857',
        }),
        url: (extent, resolution, projection) => {
            const epsg = projection.getCode();
            return `${serverUrl}REQUEST=GetFeature&SERVICE=WFS&VERSION=2.0.0&OUTPUTFORMAT=geojson&TYPENAMES=${layerConfig.id}&srsName=${epsg}&BBOX=${extent.join(',')},${epsg}`;
        },
        strategy: bboxStrategy,
    });
    return new VectorLayer({ source, name: layerConfig.id });
}

function main() {
    const classFileName = document.getElementById('class-file-name');
    const symFileName = document.getElementById('sym-file-name');
    const symPanel = document.getElementById('sym-panel');

    const wmsSource = new ImageWMS({
        url: serverUrl,
        params: {
            VERSION: '1.3.0',
            FORMAT: 'image/png',
            TRANSPARENT: true,
        },
        serverType: 'mapserver',
    });

    new Map({
        target: 'map-left',
        layers: [baseLayer(), new ImageLayer({ source: wmsSource })],
        view: sharedView,
    });

    const mapRight = new Map({
        target: 'map-right',
        layers: [],
        view: sharedView,
    });

    let switchToken = 0;
    async function switchLayer(layerConfig) {

        const token = ++switchToken;

        // Left map: MapServer renders the layer itself
        wmsSource.updateParams({ LAYERS: layerConfig.id });

        // Right map: WFS features styled in OpenLayers from the SLD
        const vectorLayer = createVectorLayer(layerConfig);

        const classFile = `${layerConfig.id}.class`;
        const symFile = `${layerConfig.id}.sym`;

        const [classText, symText, sld] = await Promise.all([
            fetchText(`${includesUrl}${classFile}`)
                .catch((error) => `# Could not load ${classFile}: ${error.message}`),
            fetchOptionalText(`${includesUrl}${symFile}`)
                .catch(() => null),
            fetchSld(layerConfig)
                .then(async (sldXmlString) => {
                    await applySld(sldXmlString, vectorLayer);
                    return sldXmlString;
                })
                .catch((error) => {
                    console.error(`Failed to style layer ${layerConfig.id}`, error);
                    return `Could not load or apply the SLD: ${error.message}`;
                }),
        ]);

        if (token !== switchToken) {
            return; // a newer switch happened, discard this one
        }

        classFileName.textContent = classFile;
        setText(classView, classText);

        // The symbols file is optional: hide its panel when there is none
        symPanel.hidden = symText === null;
        symFileName.textContent = symText === null ? '' : symFile;
        setText(symView, symText ?? '');

        showSld(sld);

        mapRight.getLayers().clear();
        mapRight.addLayer(baseLayer());
        mapRight.addLayer(vectorLayer);
    }

    // Populate the layer selector
    const select = document.getElementById('layer-select');
    demoLayers.forEach((layer, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = layer.title ?? `${layer.id} (${layer.type})`;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        switchLayer(demoLayers[Number(e.target.value)]);
    });

    switchLayer(demoLayers[0]);
}

main();