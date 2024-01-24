<template>
    <v-text-field
        v-model="address" :readonly="readOnly" :label="$t('addressLabel')" :placeholder="$t('addressLabel')"
        @update:focused="onAddressChange"></v-text-field>
    <div ref="map" class="openlayers-map"></div>
</template>

<script lang="ts">
import 'ol/ol.css';
import { ref, onMounted, defineComponent } from 'vue';
import { Map, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Point } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import lodash from "lodash";


export default defineComponent({
    name: 'OpenLayersMap',
    props: {
        readOnly: {
            type: Boolean,
            required: true
        }},
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

        const initializeMap = (mapElement: any) => {
            const olMap = new Map({
                target: mapElement,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
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
            vectorSource.addFeature(marker.value);
        }

        const reverseGeolocation = (coords: any) => {
            fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
            .then(function(response) {
                return response.json();
            }).then((json) => {
                if (json.address.house_number == undefined) {
                    if (json.address.building == undefined) {
                        address.value = json.address.road + ", " + json.address.city;
                    } else {
                        address.value = json.address.road + ", " + json.address.building + ", " + json.address.city;
                    }
                } else {
                    address.value = json.address.road + " " + json.address.house_number + ", " + json.address.city;
                }
            });
        };

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
  