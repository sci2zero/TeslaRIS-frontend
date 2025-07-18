<template>
    <div v-show="preloadedDoi" class="pr-4">
        <div class="d-sr-only text-subtitle-1 font-weight-medium mb-3">
            {{ $t("externalMetricsLabel") }}
        </div>
        <div class="d-flex flex-row justify-end flex-wrap gap-2">
            <div
                class="altmetric-embed"
                data-badge-type="donut"
                data-badge-popover="left"
                data-hide-no-mentions="true"
                data-badge-details="hover"
                :data-doi="preloadedDoi">
            </div>
            <span
                class="__dimensions_badge_embed__ ml-5"
                data-style="small_circle"
                data-hide-zero-citations="true"
                :data-doi="preloadedDoi">
            </span>
            <div class="ml-5">
                <a
                    class="plumx-plum-print-popup plum-bigben-theme"
                    :href="`https://plu.mx/plum/a/?doi=${preloadedDoi}`"
                    target="_blank"
                    data-popup="left"
                    data-size="medium"
                    data-site="plum"
                    data-hide-when-empty="true"
                >
                    PlumX Metrics
                </a>
            </div>
            <div ref="openCitationsContainer" class="openCitationsContainer ml-5"></div>
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
        </div>
    </div>
</template>

<script lang="ts">
import { type ExternalIndicatorConfiguration } from "@/models/AssessmentModel";
import ExternalIndicatorConfigurationService from "@/services/assessment/ExternalIndicatorConfigurationService";
import { defineComponent, type PropType, ref, watch } from "vue";


export default defineComponent({
    name: "PublicationBadgeSection",
    props: {
        preloadedDoi: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        documentId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    setup(props) {
        const openCitationsContainer = ref<HTMLElement | null>(null);
        const oaStatus = ref<"open" | "closed" | null>(null);
        const oaLocation = ref<string | null>(null);

        const unpaywallEmail = import.meta.env.VITE_UNPAYWALL_EMAIL as string;

        const initBadges = (configuration: ExternalIndicatorConfiguration) => {
            if (configuration.showAltmetric && (typeof window) !== "undefined" && ((window as any)._altmetric_embed_init)) {
                (window as any)._altmetric_embed_init();
                fixLinkToSource("altmetric-embed");
                setTimeout(() => fixLinkToSource("altmetric-embed"), 1000);
            }

            if (configuration.showDimensions && (typeof window) !== "undefined" && ((window as any).__dimensions_embed.addBadges)) {
                (window as any).__dimensions_embed.addBadges();
                fixLinkToSource("__dimensions_badge_embed__");
            }

            if (configuration.showPlumX && (typeof window) !== "undefined" && ((window as any).__plumX.widgets.init)) {
                (window as any).__plumX.widgets.init();
            }
        };

        const fixLinkToSource = (rootDivClassName: string) => {
            document.querySelectorAll("." + rootDivClassName).forEach(container => {
            const links = container.querySelectorAll("a");
                links.forEach(link => {
                    link.setAttribute("target", "_blank");
                    link.setAttribute("rel", "noopener noreferrer");
                });
            });
        };

        watch(
            [
                () => props.preloadedDoi,
                () => props.documentId
            ], () => {
                if (props.preloadedDoi && props.documentId) {

                    ExternalIndicatorConfigurationService.readConfigurationForDocument(
                        props.documentId
                    ).then(response => {
                        if (openCitationsContainer.value && response.data.showOpenCitations) {
                            const script = document.createElement("script");
                            script.src = "https://cdn.jsdelivr.net/gh/opencitations/badge@v1.0.0/badge.js";
                            script.setAttribute("data-type", "doi");
                            script.setAttribute("data-value", props.preloadedDoi as string);
                            script.setAttribute("data-return", "citation-count");
                            openCitationsContainer.value.innerHTML = '';
                            openCitationsContainer.value.appendChild(script);
                            fixLinkToSource("openCitationsContainer");
                            setTimeout(() => fixLinkToSource("openCitationsContainer"), 2000);   
                        }

                        if (response.data.showUnpaywall) {
                            fetchUnpaywall();
                        }
                        
                        setTimeout(
                            () => initBadges(response.data)
                        , 0);
                    });
                }
            }
        );

        const fetchUnpaywall = () => {
            fetch(
            `https://api.unpaywall.org/v2/${encodeURIComponent(props.preloadedDoi as string)}?email=${unpaywallEmail}`
            ).then(response => {
                response.json().then(result => {
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
  padding: 0.3em 0.6em;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9em;
  background-image: url("@/assets/unpaywall.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  cursor: default;
  height: 64px;
  margin-top: 5px;
  border-radius: 10px;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
}

.unpaywall-badge.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.unpaywall-badge.clickable:hover {
  opacity: 0.8;
}

.open {
    padding-left: 4.5em;
}

.closed {
    padding-left: 4.5em;
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

<style>

.openCitationsContainer img {
    width: auto;
    height: 64px;
}

.openCitationsContainer .prev-lbl {
    font-size: 16px !important;
}

.openCitationsContainer .prev-value {
    font-size: 16px !important;
}

.openCitationsContainer .__oc_text__ {
    padding: 0 !important;
    height: 64px !important;
}

</style>
