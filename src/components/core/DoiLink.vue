<template>
    <v-btn
        v-if="doi"
        variant="plain"
        class="no-uppercase m-0 p-0 h-auto semi-transparent"
        :href="`https://doi.org/${doi}`"
        target="_blank">
        {{ doi }}
    </v-btn>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';


export default defineComponent({
    name: "UriList",
    props: {
        doi: {
            type: Object as PropType<string | undefined>,
            required: true,
        }
    },
});
</script>
