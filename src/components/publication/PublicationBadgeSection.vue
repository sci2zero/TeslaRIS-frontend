<template>
    <div v-show="preloadedDoi" class="actions-box pa-4 mt-15 mb-5">
        <div class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("externalMetricsLabel") }}
        </div>
        <div class="d-flex flex-wrap gap-2">
            <div
                class="altmetric-embed"
                data-badge-type="medium-donut"
                data-badge-popover="right"
                data-hide-no-mentions="true"
                data-badge-details="hover"
                :data-doi="preloadedDoi">
            </div>
            <span
                class="__dimensions_badge_embed__ ml-5"
                data-style="medium_circle"
                data-hide-zero-citations="true"
                :data-doi="preloadedDoi">
            </span>
            <div ref="openCitationsContainer" class="ml-5"></div>
            <div
                v-if="oaStatus !== null"
                :class="[
                    'unpaywall-badge',
                    'ml-5',
                    oaStatus === 'open' ? 'open' : 'closed',
                    { 'clickable': oaLocation && oaStatus === 'open' }
                ]"
                @click="oaLocation ? accessOALocation() : null">
                <span v-if="oaStatus === 'open'">🟢 Open</span>
                <span v-else>🔴 Closed</span>
            </div>
            <div class="ml-5">
                <a
                    class="plumx-plum-print-popup plum-bigben-theme"
                    :href="`https://plu.mx/plum/a/?doi=${preloadedDoi}`"
                    data-popup="right"
                    data-size="large"
                    data-site="plum"
                    data-hide-when-empty="true"
                >
                    PlumX Metrics
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from "vue";


export default defineComponent({
    name: "PublicationBadgeSection",
    props: {
        preloadedDoi: {
            type: Object as PropType<string | undefined>,
            required: true
        }
    },
    setup(props) {
        const openCitationsContainer = ref<HTMLElement | null>(null);
        const oaStatus = ref<"open" | "closed" | null>(null);
        const oaLocation = ref<string | null>(null);

        const initBadges = () => {
            if ((typeof window) !== "undefined" && ((window as any)._altmetric_embed_init)) {
                (window as any)._altmetric_embed_init();
                (window as any).__dimensions_embed.addBadges();
                (window as any).__plumX.widgets.init();
            }
        };

        watch(() => props.preloadedDoi, () => {
            if (props.preloadedDoi) {
                if (!openCitationsContainer.value) return;

                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/gh/opencitations/badge@v1.0.0/badge.js";
                script.setAttribute("data-type", "doi");
                script.setAttribute("data-value", props.preloadedDoi as string);
                script.setAttribute("data-return", "citation-count");
                openCitationsContainer.value.innerHTML = '';
                openCitationsContainer.value.appendChild(script);

                fetchUnpaywall();
                setTimeout(initBadges, 0);
            }
        });

        const fetchUnpaywall = () => {
            fetch(
            `https://api.unpaywall.org/v2/${encodeURIComponent(props.preloadedDoi as string)}?email=chenejac@uns.ac.rs`
            ).then(response => {
                response.json().then(result => {
                    console.log(result)
                    oaStatus.value = result.is_oa ? "open" : "closed";
                    if (result.is_oa) {
                        oaLocation.value = result.best_oa_location.url;
                    }
                })
            }).catch(() => {
                oaStatus.value = null;
            });
        };

        const accessOALocation = () => {
            window.open(oaLocation.value as string, "_blank");
        };

        return {
            openCitationsContainer,
            oaStatus, oaLocation,
            accessOALocation
        };
    }
});
</script>

<style scoped>

.unpaywall-badge {
  display: inline-block;
  padding: 0.3em 0.4em;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9em;
  background-image: url("@/assets/unpaywall.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  cursor: default;
}

.unpaywall-badge.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.unpaywall-badge.clickable:hover {
  opacity: 0.8;
}

.open {
    padding-left: 4em;
}

.closed {
    padding-left: 3.3em;
}

.unpaywall-badge.open {
  background-color: #d0f0c0;
  color: #2b662d;
}

.unpaywall-badge.closed {
  background-color: #f8d7da;
  color: #842029;
}
</style>
