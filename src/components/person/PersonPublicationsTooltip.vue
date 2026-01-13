<template>
    <v-tooltip
        location="end"
        max-width="600"
        :open-on-hover="true"
    >
        <template #activator="{ props: tooltipProps }">
            <div
                v-bind="tooltipProps"
                class="d-flex align-center"
                @mouseenter="loadPublications"
            >
                <slot></slot>
            </div>
        </template>

        <div class="tooltip-content">
            <div v-if="loading">
                {{ $t('loadingLabel') }}…
            </div>

            <div v-else-if="text">
                <h3>{{ $t("latestPublicationsLabel") }}</h3>
                <pre class="publications mt-7">{{ text }}</pre>
            </div>

            <div v-else-if="personId && personId > 0">
                {{ $t('noPublicationsForResearcherMessage') }}
            </div>

            <div v-else>
                {{ $t("addExternalAssociateLabel") }}
            </div>
        </div>
    </v-tooltip>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DocumentPublicationService from '@/services/DocumentPublicationService'


export default defineComponent({
    name: 'PersonPublicationsTooltip',
    props: {
        personId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const text = ref('');
        const loading = ref(false);
        const loaded = ref(false);

        const loadPublications = async () => {
            if (loaded.value || loading.value) {
                return;
            }

            loading.value = true;

            try {
                const response =
                    await DocumentPublicationService.findResearcherPublications(
                        props.personId,
                        [],
                        "page=0&size=5&sort=year,DESC"
                    );

                if (response.data.totalElements === 0) {
                    text.value = "";
                } else {
                    text.value = response.data.content
                        .map((p: any) => p.apa)
                        .join("\n\n");
                }

                loaded.value = true;
            } finally {
                loading.value = false;
            }
        }

        return {
            text, loading,
            loadPublications
        }
    }
})
</script>

<style scoped>
.tooltip-content {
    max-height: 300px;
    overflow-y: auto;
}

.publications {
    white-space: pre-wrap;
    font-size: 0.85rem;
}
</style>
