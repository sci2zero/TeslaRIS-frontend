<template>
    <a
        v-if="identifier && href"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-flex max-w-full items-baseline gap-1 text-sm font-medium leading-5 text-slate-800 break-all rounded-sm transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
    >
        <span class="underline decoration-slate-400 underline-offset-2 group-hover:decoration-blue-700">
            {{ identifier }}
        </span>
        <span
            class="mdi mdi-open-in-new shrink-0 text-[0.75em] text-slate-400 group-hover:text-blue-700"
            aria-hidden="true"
        />
    </a>
    <span
        v-else-if="identifier"
        class="inline-flex max-w-full items-baseline text-sm font-medium leading-5 text-slate-800 break-all"
    >
        {{ identifier }}
    </span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { crisContextInformationState } from '@/composables/useCrisContextInformation';
import { buildIdentifierUrl } from '@/utils/StringUtil';



export default defineComponent({
    name: "IdentifierLink",
    props: {
        identifier: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "doi"
        },
        compact: {
            type: Boolean,
            default: false
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
                case "scopus_author":
                    return "https://www.scopus.com/authid/detail.uri?authorId=";
                case "scopus_affiliation":
                    return "https://www.scopus.com/pages/organization/";
                case "scopus":
                    return "https://www.scopus.com/pages/publications/"
                case "open_alex":
                    return "https://openalex.org/";
                case "ror":
                    return "https://ror.org/";
                case "raid":
                    return "https://raid.org/";
                case "researcher_id":
                    return "http://www.researcherid.com/rid/";
                case "web_of_science":
                    return "https://www.webofscience.com/api/gateway?GWVersion=2&SrcApp=teslaris&SrcAuth=WosAPI&DestLinkType=FullRecord&DestApp=WOS_CPL&KeyUT=WOS:";
                case "scholar":
                    return "https://scholar.google.com/citations?user=";
                case "lattes":
                    return "http://lattes.cnpq.br/";
                case "authenticus":
                    return "https://authenticus.pt/author/";
                case "wikidata":
                    return "https://www.wikidata.org/wiki/";
            }

            return "https://doi.org/";
        };

        const nationalIdUrlTemplate = computed(() => {
            switch (props.type) {
                case "national_person":
                    return crisContextInformationState.value.personNationalIdUrl;
                case "national_organisation_unit":
                    return crisContextInformationState.value.organisationUnitNationalIdUrl;
                case "national_project":
                    return crisContextInformationState.value.projectNationalIdUrl;
                case "national_document":
                    return crisContextInformationState.value.documentNationalIdUrl;
            }

            return undefined;
        });

        const isNationalIdentifier = computed(() => props.type.startsWith("national_"));

        // A national identifier has no portal unless this deployment configured one, in which case
        // the identifier renders as plain text.
        const href = computed(() => {
            if (isNationalIdentifier.value) {
                return buildIdentifierUrl(nationalIdUrlTemplate.value, props.identifier);
            }

            return `${computeBaseURL()}${props.identifier}`;
        });

        return { href };
    }
});
</script>
