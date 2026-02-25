<template>
    <v-menu
        v-model="isOpen"
        location="end"
        :open-on-hover="false"
        :close-on-content-click="false"
        transition="fade-transition">
        <template #activator="{ props: menuProps }">
            <div
                v-bind="menuProps"
                class="d-flex align-center"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave">
                <slot></slot>
            </div>
        </template>

        <v-card
            max-width="600"
            class="tooltip-content"
            @mouseenter="cancelClose"
            @mouseleave="handleMouseLeave">
            <v-card-text>
                <div v-if="loading">
                    {{ $t('loadingLabel') }}…
                </div>

                <div v-else-if="text">
                    <h3 class="tooltip-title">
                        {{ $t("latestPublicationsLabel") }}
                    </h3>
                    <pre class="publications mt-4">{{ text }}</pre>
                </div>

                <div v-else-if="personId && personId > 0">
                    {{ $t('noPublicationsForResearcherMessage') }}
                </div>

                <div v-else>
                    {{ $t("addExternalAssociateLabel") }}
                </div>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DocumentPublicationService from '@/services/DocumentPublicationService'


export default defineComponent({
    name: "PersonPublicationsTooltip",
    props: {
        personId: {
            type: Number,
            required: true
        },
        show: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const text = ref("");
        const loading = ref(false);
        const loaded = ref(false);
        const isOpen = ref(false);
        let closeTimeout: number | null = null;

        const handleMouseEnter = () => {
            if (!props.show) return;

            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }

            isOpen.value = true;
            loadPublications();
        };

        const handleMouseLeave = () => {
            closeTimeout = window.setTimeout(() => {
                isOpen.value = false;
            }, 200);
        };

        const cancelClose = () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        };

        const loadPublications = async () => {
            if (loaded.value || loading.value) return;

            loading.value = true;

            try {
                const response =
                    await DocumentPublicationService.findResearcherPublications(
                        props.personId,
                        [],
                        "page=0&size=5&sort=year,DESC"
                    );

                text.value = response.data.totalElements === 0
                    ? ""
                    : response.data.content.map((p: any) => p.apa).join("\n\n");

                loaded.value = true;
            } finally {
                loading.value = false;
            }
        };

        return {
            text,
            loading,
            isOpen,
            handleMouseEnter,
            handleMouseLeave,
            cancelClose
        };
    }
})
</script>

<style scoped>
.tooltip-content {
    max-height: 300px;
    overflow-y: auto;
}

.tooltip-content::-webkit-scrollbar {
    width: 6px;
}

.tooltip-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.tooltip-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
}

.tooltip-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
}

.publications {
    white-space: pre-wrap;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    margin: 0;
    font-family: inherit;
}

.tooltip-title {
    margin-top: -10px;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
}

:deep(.v-card) {
    background-color: rgba(33, 33, 33, 0.95) !important;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-card-text) {
    color: rgba(255, 255, 255, 0.9);
}

:deep(.text-medium-emphasis) {
    color: rgba(255, 255, 255, 0.7) !important;
}

.border-bottom {
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
