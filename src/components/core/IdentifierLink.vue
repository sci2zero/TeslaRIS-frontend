<template>
    <v-btn
        v-if="identifier"
        variant="plain"
        class="no-uppercase m-0 p-0 h-auto semi-transparent"
        :style="{ fontSize: '1.2rem', fontWeight: 'bold', marginLeft: '-15px' }"
        :href="`${computeBaseURL()}${identifier}`"
        target="_blank">
        {{ identifier }}
    </v-btn>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';


export default defineComponent({
    name: "IdentifierLink",
    props: {
        identifier: {
            type: Object as PropType<string | undefined>,
            required: true,
        },
        type: {
            type: String,
            default: "doi"
        }
    },
    setup (props) {
        const computeBaseURL = () => {
            switch (props.type) {
                case "doi":
                    return "https://doi.org/";
                case "orcid":
                    return "https://orcid.org/";
                case "email":
                    return "mailto:";
                case "ecris":
                    return "https://bib.cobiss.net/biblioweb/biblio/sr/scr/cris/";
                case "scopus_author":
                    return "https://www.scopus.com/authid/detail.uri?authorId=";
                case "scopus_affiliation":
                    return "https://www.scopus.com/pages/organization/";
            }

            return "https://doi.org/";
        };

        return { computeBaseURL };
    }
});
</script>
