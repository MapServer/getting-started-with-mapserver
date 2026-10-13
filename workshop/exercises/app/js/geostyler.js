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
import { json } from '@codemirror/lang-json';

const mapserverUrl = import.meta.env.VITE_MAPSERVER_BASE_URL;
const mapfilesPath = import.meta.env.VITE_MAPFILES_PATH;

const serverUrl = `${mapserverUrl}${mapfilesPath}geostyler.map&`;
const includesUrl = `${import.meta.env.BASE_URL}includes/`;

/**
 * Layers available in the demo.
 *
 * - id: the MapServer LAYER name.
 * - type: the geometry type, shown in the layer selector
 * - styles (optional): the layer's style names (its CLASS GROUPs), shown in
 *   the style selector. Without it, the layer's default style is used.
 * - title (optional): label in the layer selector
 * - sldUrl (optional, for testing): load the SLD from this URL instead of
 *   a GetStyles request
 * - geostylerUrl (optional, for testing): load a GeoStyler style (JSON) from
 *   this URL and use it instead of an SLD
 */
const demoLayers = [
    { id: 'arrow-wide', type: 'line' },
    { id: 'notched-rect', type: 'point' },
    { id: 'square-spaced', type: 'polygon' },
    // Temporarily use a SLD file instead of MapServer's SLD
    // { id: 'wave', type: 'polygon', sldUrl: `${import.meta.env.BASE_URL}styles/slash.sld.xml` },
    {
        id: 'wave',
        type: 'polygon',
        styles: ['Horizontal', 'Vertical']
    },

    // Temporarily use a GeoStyler style instead of MapServer's SLD
    // { id: 'fills', type: 'polygon', geostylerUrl: `${import.meta.env.BASE_URL}styles/fills.geostyler.json` },
    {
        id: 'fills',
        type: 'polygon'
    },

    {
        id: 'hatch',
        type: 'polygon',
        styles: ['Horizontal', 'Vertical', 'Slash', 'Backslash', 'Cross', 'Diagonal']
    },
];

// Shown for layers without a styles list; sent to MapServer as an empty
// STYLES value, which selects the layer's default style
const DEFAULT_STYLE = 'default';

const getStyles = (layerConfig) =>
    layerConfig.styles?.length ? layerConfig.styles : [DEFAULT_STYLE];

const getStylesParam = (style) => (style === DEFAULT_STYLE ? '' : style);

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
                EditorView.lineWrapping,
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
const geostylerView = createViewer('geostyler-text', json());


/**
 * For display only: add the decoded SVG as a comment. The SLD that is
 * parsed and applied is not changed.
 */
function addDecodedSvgComments(sldText) {
    const pattern = /^([ \t]*)(<se:OnlineResource\b[^>]*href="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"[^>]*>)/gm;

    return sldText.replace(pattern, (match, indent, tag, base64) => {
        try {
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            let svg = new TextDecoder().decode(bytes).trim();
            try {
                svg = xmlFormat(svg, { indentation: '  ', collapseContent: true });
            } catch {
                // leave the SVG as decoded
            }
            svg = svg
                .replace(/ M /g, '\n      M ') // one subpath (tile copy) per line
                .replace(/--/g, '- -')         // "--" is not allowed inside an XML comment
                .split('\n')
                .map((line) => `${indent}  ${line}`)
                .join('\n');
            return `${indent}<!-- Decoded SVG:\n${svg}\n${indent}-->\n${indent}${tag}`;
        } catch {
            return match; // not valid base64: show as is
        }
    });
}
function showSld(text) {
    let formatted = text;
    try {
        formatted = xmlFormat(text, { indentation: '  ', collapseContent: true });
    } catch {
        // not XML (e.g. an error message): show as is
    }
    setText(sldView, addDecodedSvgComments(formatted));
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
 * Fetch the SLD for a layer and style with a GetStyles request, and return
 * it as a string. An sldUrl in the layer config overrides the GetStyles
 * request (e.g. for testing).
 */
async function fetchSld(layerConfig, style) {
    const stylesParam = encodeURIComponent(getStylesParam(style));
    const sldUrl = layerConfig.sldUrl
        ?? `${serverUrl}REQUEST=GetStyles&SERVICE=WMS&VERSION=1.3.0&LAYERS=${layerConfig.id}&STYLES=${stylesParam}`;

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
 * Load a GeoStyler style saved as JSON.
 */
async function fetchGeoStylerStyle(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch GeoStyler style: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Convert a GeoStyler style to an OpenLayers style, and apply it.
 */
async function applyGeoStylerStyle(geostylerStyle, vectorLayer) {
    console.log(`GeoStyler style for layer ${vectorLayer.get('name')}:`, geostylerStyle);

    const ol = await olParser.writeStyle(geostylerStyle);
    if (ol.errors) {
        throw new Error(`Errors writing the OpenLayers style: ${ol.errors}`);
    }
    console.log(`OpenLayers style for layer ${vectorLayer.get('name')}:`, ol.output);

    vectorLayer.setStyle(ol.output);
}

/**
 * Convert an SLD to an OpenLayers style with GeoStyler, and apply it.
 * Returns the GeoStyler style the OpenLayers style was created from.
 */
async function applySld(sldXmlString, vectorLayer) {
    const gs = await sldParser.readStyle(sldXmlString);
    if (gs.errors) {
        throw new Error(`Errors parsing the SLD: ${gs.errors}`);
    }
    await applyGeoStylerStyle(gs.output, vectorLayer);
    return gs.output;
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
    async function switchLayer(layerConfig, style) {
        const token = ++switchToken;

        // Left map: MapServer renders the layer itself
        wmsSource.updateParams({ LAYERS: layerConfig.id, STYLES: getStylesParam(style) });

        // Right map: WFS features styled in OpenLayers from the SLD
        const vectorLayer = createVectorLayer(layerConfig);

        const classFile = `${layerConfig.id}.class`;
        const symFile = `${layerConfig.id}.sym`;

        // A geostylerUrl in the layer config replaces the SLD (e.g. for testing)
        const loadStyle = layerConfig.geostylerUrl
            ? fetchGeoStylerStyle(layerConfig.geostylerUrl)
                .then(async (gsStyle) => {
                    await applyGeoStylerStyle(gsStyle, vectorLayer);
                    const note = `<!-- No SLD: GeoStyler style loaded from ${layerConfig.geostylerUrl} -->`;
                    return { sld: note, geostylerStyle: gsStyle };
                })
            : fetchSld(layerConfig, style)
                .then(async (sldXmlString) => {
                    const gsStyle = await applySld(sldXmlString, vectorLayer);
                    return { sld: sldXmlString, geostylerStyle: gsStyle };
                });

        const [classText, symText, { sld, geostylerStyle }] = await Promise.all([
            fetchText(`${includesUrl}${classFile}`)
                .catch((error) => `# Could not load ${classFile}: ${error.message}`),
            fetchOptionalText(`${includesUrl}${symFile}`)
                .catch(() => null),
            loadStyle
                .catch((error) => {
                    console.error(`Failed to style layer ${layerConfig.id}`, error);
                    const message = `Could not load or apply the style: ${error.message}`;
                    return { sld: message, geostylerStyle: null };
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
        setText(geostylerView, geostylerStyle
            ? JSON.stringify(geostylerStyle, null, 2)
            : '// No GeoStyler style: see the SLD tab for the error');

        mapRight.getLayers().clear();
        mapRight.addLayer(baseLayer());
        mapRight.addLayer(vectorLayer);
    }

    // Tabs in the bottom-right panel: show one viewer at a time
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => {
                const active = t === tab;
                t.classList.toggle('active', active);
                document.getElementById(t.dataset.tab).hidden = !active;
            });
        });
    });

    const layerSelect = document.getElementById('layer-select');
    const styleSelect = document.getElementById('style-select');

    /**
     * Fill the style selector with the styles of a layer, select the first
     * one, and return it. The selector is disabled if there's only one style.
     */
    function populateStyles(layerConfig) {
        const styles = getStyles(layerConfig);
        styleSelect.replaceChildren(...styles.map((style) => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style;
            return option;
        }));
        styleSelect.disabled = styles.length === 1;
        return styles[0];
    }

    const selectedLayer = () => demoLayers[Number(layerSelect.value)];

    // Populate the layer selector
    demoLayers.forEach((layer, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = layer.title ?? `${layer.id} (${layer.type})`;
        layerSelect.appendChild(option);
    });

    layerSelect.addEventListener('change', () => {
        const layerConfig = selectedLayer();
        switchLayer(layerConfig, populateStyles(layerConfig));
    });

    styleSelect.addEventListener('change', () => {
        switchLayer(selectedLayer(), styleSelect.value);
    });

    switchLayer(demoLayers[0], populateStyles(demoLayers[0]));
}

main();