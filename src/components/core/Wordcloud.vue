<template>
    <div
        :class="[
            compactIcon ? 'wordcloud-compact-icon' : 'wordcloud',
            { 'wordcloud--empty': isReady && !hasEnoughWords }
        ]">
        <vue3-word-cloud
            v-if="hasEnoughWords"
            show-progress
            :words="localWordcloudFrequencies"
            :color="([, weight]: [string, number]) => weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo'"
            font-family="sans-serif"
            animation-overlap="20%"
            font-size-ratio="20%"
            animation-easing="ease"
        />
        <p
            v-else-if="isReady"
            class="wordcloud-empty">
            {{ $t("notEnoughWordcloudDataMessage") }}
        </p>
    </div>
</template>

<script lang="ts">
import { PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { computed, defineComponent, onMounted, ref, watch, type PropType } from 'vue';
import Vue3WordCloud from 'vue3-word-cloud';

const MIN_WORDCLOUD_WORDS = 20;

export default defineComponent({
    name: "WordCloud",
    components: { Vue3WordCloud },
    emits: ["visible"],
    props: {
        wordcloudFrequencies: {
            type: Array<[string, number]>,
            default: []
        },
        forDocumentId: {
            type: Number,
            default: 0
        },
        compactIcon: {
            type: Boolean,
            default: false
        },
        documentType: {
            type: Object as PropType<PublicationType>,
            required: true
        }
    },
    setup(props, { emit }) {
        const localWordcloudFrequencies = ref<[string, number][]>([]);
        const isReady = ref(false);

        const hasEnoughWords = computed(() =>
            localWordcloudFrequencies.value.length >= MIN_WORDCLOUD_WORDS
        );

        const notifyVisibility = () => {
            emit("visible", isReady.value && hasEnoughWords.value);
        };

        onMounted(() => {
            if (props.wordcloudFrequencies.length > 0) {
                populateLocalFrequencies();
            } else if (props.forDocumentId > 0) {
                fetchWordcloudForDocument();
            } else {
                isReady.value = true;
                notifyVisibility();
            }
        });

        watch(() => props.wordcloudFrequencies, () => {
            if (props.wordcloudFrequencies.length > 0 || props.forDocumentId <= 0) {
                populateLocalFrequencies();
            }
        });

        watch(() => props.forDocumentId, () => {
            if (props.forDocumentId > 0) {
                fetchWordcloudForDocument();
            }
        });

        const fetchWordcloudForDocument = () => {
            const requestedId = props.forDocumentId;
            isReady.value = false;
            localWordcloudFrequencies.value = [];
            DocumentPublicationService.getWordcloudForSingleDocument(
                requestedId,
                props.documentType
            ).then(response => {
                    if (props.forDocumentId !== requestedId) {
                        return;
                    }
                    localWordcloudFrequencies.value =
                        response.data.map(
                            termFrequency => [termFrequency.a, termFrequency.b]
                        );
                }).finally(() => {
                    if (props.forDocumentId !== requestedId) {
                        return;
                    }
                    isReady.value = true;
                    notifyVisibility();
                });
        };

        const populateLocalFrequencies = () => {
            localWordcloudFrequencies.value = props.wordcloudFrequencies;
            isReady.value = true;
            notifyVisibility();
        };

        return {
            localWordcloudFrequencies,
            hasEnoughWords,
            isReady
        };
    }
});
</script>

<style scoped>

.wordcloud {
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
}

.wordcloud--empty {
    height: auto;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wordcloud-compact-icon {
    width: 100%;
    height: 100%;
}

.wordcloud-empty {
    margin: 0;
    color: #64748b;
    text-align: center;
}

</style>
