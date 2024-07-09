<template>
    <v-text-field
        v-if="showInput" 
        v-model="address" :readonly="readOnly" :label="$t('addressLabel')" :placeholder="$t('addressLabel')"
        @update:focused="onAddressChange"></v-text-field>
    <div ref="map" :style="'height: ' + height" class="openlayers-map"></div>
</template>

<script lang="ts">
import 'ol/ol.css';
import { ref, onMounted, defineComponent, watch } from 'vue';
import { Map, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Point } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import lodash from "lodash";
import TileJSON from 'ol/source/TileJSON.js';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle.js';


export default defineComponent({
    name: 'OpenLayersMap',
    props: {
        readOnly: {
            type: Boolean,
            required: true
        },
        showInput: {
            type: Boolean,
            required: false,
            default: true,
        },
        initCoordinates: {
            type: Array<number>,
            required: false,
            default: () => {[19.8335, 45.2671]},
        },
        height: {
            type: String,
            required: false,
            default: "300px",
        }
    },

    setup(props) {
        const map = ref<Map | null>(null);
        const marker = ref();
        const currentPosition = ref({lat: 0.0, lon: 0.0});
        const vectorSource = new VectorSource({});
        const vectorLayer = new VectorLayer({source: vectorSource});
        const view = new View({center: fromLonLat([19.8335, 45.2671]), zoom: 4});
        const address = ref("");

        onMounted(() => {
            initializeMap(map.value);
        });

        watch(() => props.initCoordinates, (position) => {
            if(position[0] === null || position[1] === null) {
                return;
            }
            view.setCenter(fromLonLat(position));
            view.setZoom(15);
            setMarker(position);

            currentPosition.value.lat = parseFloat(position.toString().split(",")[1]);
            currentPosition.value.lon = parseFloat(position.toString().split(",")[0]);
            reverseGeolocation(position);
        });

        const initializeMap = (mapElement: any) => {

            const adminBoundaryLayer = new TileLayer({
                source: new TileJSON({
                    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_disputed_areas_scale_rank_minor_islands/map/tiles/WorldCRS84Quad?f=tilejson',
                    crossOrigin: 'anonymous',
                }),
            });

            const olMap = new Map({
                target: mapElement,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    adminBoundaryLayer,
                    vectorLayer
                ],
                view: view
            });

            if (!props.readOnly) {
                olMap.on('click', onPointClick);
            }

            map.value = olMap;
        };

        const setMarker = (position: any) => {
            marker.value = new Feature(new Point(fromLonLat(position)));
            const biggerPointSize = 25;
            const biggerPointStyle = new Style({
                image: new CircleStyle({
                    radius: biggerPointSize,
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.5)',
                    }),
                    stroke: new Stroke({
                        color: 'rgba(255, 0, 0, 0.8)',
                        width: 2,
                    }),
                }),
            });

            marker.value.setStyle(biggerPointStyle);
            vectorSource.clear();
            vectorSource.addFeature(marker.value);
        }

        const reverseGeolocation = (coords: any) => {
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
            .then(function(response) {
                return response.json();
            }).then((json) => {
                if(!json.address) {
                    return;
                }

                if (json.address.house_number == undefined) {
                    if (json.address.building == undefined) {
                        address.value = json.address.road + ", " + json.address.city;
                    } else {
                        address.value = json.address.road + ", " + json.address.building + ", " + json.address.city;
                    }
                } else {
                    address.value = json.address.road + " " + json.address.house_number + ", " + json.address.city;
                }

                address.value = removeLeadingAndTrailingCommas(address.value.replace(/undefined/g, ""));
            });
        };

        const removeLeadingAndTrailingCommas = (str: string) => {
            str = str.trim();
            str = str.replace(/^,*/, '');
            str = str.replace(/,*$/, '');
            return str.trim();
        }

        const getCoordsFromAddress = (address: string) => {
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&polygon=1&addressdetails=1`)
            .then((response) => {
                    return response.json();
                })
            .then((data) => {
                const result = data[0];
                if (result) {
                    const geopoint = {
                        lat: parseFloat(result.lat),
                        lon: parseFloat(result.lon),
                    };
                    currentPosition.value = geopoint;
                    vectorSource.clear();
                    setMarker([geopoint.lon, geopoint.lat]);
                    view.setCenter(fromLonLat([geopoint.lon, geopoint.lat]));
                    view.setZoom(15);
                }
            });
        };

        const onPointClick = (event: any) => {
            const position = toLonLat(event.coordinate);
            currentPosition.value.lat = parseFloat(position.toString().split(",")[1]);
            currentPosition.value.lon = parseFloat(position.toString().split(",")[0]);
            vectorSource.clear();
            setMarker(position);
            reverseGeolocation(position);
        };

        const onAddressChange = lodash.debounce(() => {
            if (!props.readOnly) {
                getCoordsFromAddress(address.value)
            }
        }, 1000);

        const clearInput = () => {
            address.value = "";
            vectorSource.clear();
            view.setCenter(fromLonLat([19.8335, 45.2671]));
            view.setZoom(4);
        };

        return {
            map, address, onAddressChange, currentPosition, clearInput
        };
    }
});
</script>

<style scoped>
.openlayers-map {
width: 100%;
height: 400px;
}
</style>
  