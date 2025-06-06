<template>
    <div
        :class="compactIcon ? 'wordcloud-compact-icon' : 'wordcloud'">
        <vue3-word-cloud
            show-progress
            :words="localWordcloudFrequencies"
            :color="([, weight]: [string, number]) => weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo'"
            font-family="sans-serif"
            animation-overlap="20%"
            font-size-ratio="20%"
            animation-easing="ease"
        />
    </div>
</template>

<script lang="ts">
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { defineComponent, onMounted, ref, watch } from 'vue';
import Vue3WordCloud from 'vue3-word-cloud';


export default defineComponent({
    name: "WordCloud",
    components: { Vue3WordCloud },
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
        }
    },
    setup(props) {
        const localWordcloudFrequencies = ref<[string, number][]>([]);

        onMounted(() => {
            if (props.wordcloudFrequencies.length > 0) {
                populateLocalFrequencies();
            } else if (props.forDocumentId > 0) {
                fetchWordcloudForDocument();
            }
        });

        watch(() => props.wordcloudFrequencies, () => {
            if (props.wordcloudFrequencies.length > 0) {
                populateLocalFrequencies();
            }
        });

        watch(() => props.forDocumentId, () => {
            if (props.forDocumentId > 0) {
                fetchWordcloudForDocument();
            }
        });

        const fetchWordcloudForDocument = () => {
            DocumentPublicationService.getWordcloudForSingleDocument(props.forDocumentId)
                .then(response => {
                    localWordcloudFrequencies.value =
                        response.data.map(
                            termFrequency => [termFrequency.a, termFrequency.b]
                        );
                });
        };

        const populateLocalFrequencies = () => {
            localWordcloudFrequencies.value.splice(0);
            localWordcloudFrequencies.value = props.wordcloudFrequencies;
        };

        return {
            localWordcloudFrequencies
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

.wordcloud-compact-icon {
    width: 100%;
    height: 100%;
}

</style>
