<template>
    <div v-for="uri in uris" :key="uri" class="uri">
        <v-btn
            variant="plain"
            class="no-uppercase m-0 p-0 h-auto semi-transparent text-h6"
            :href="uri"
            target="_blank">
            {{ truncateUri(uri) }}
        </v-btn>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';


export default defineComponent({
    name: "UriList",
    props: {
        uris: {
            type: Object as PropType<Array<string> | undefined>,
            required: true,
        }
    },
    setup() {
        const truncateUri = (uri: string) => {
            const maxLength = 50;
            return uri.length > maxLength ? uri.slice(0, maxLength) + '…' : uri;
        };

        return {
            truncateUri
        };
    }
});
</script>

<style scoped>

.uri {
    margin-top: 10px;
    margin-left: -15px;
}

:deep(.v-btn__content) {
    grid-area: content;
    justify-content: right;
    white-space: break-spaces;
}

</style>
