<template>
    <v-col cols="6">
        <div v-if="document?.scopusId">
            {{ $t('scopusIdLabel') }}:
        </div>
        <div v-if="document?.scopusId" class="response">
            <identifier-link :identifier="document.scopusId" type="scopus" />
        </div>

        <div v-if="document?.doi">
            DOI:
        </div>
        <div v-if="document?.doi" class="response">
            <identifier-link :identifier="document.doi" />
        </div>

        <div v-if="document?.openAlexId">
            Open Alex ID:
        </div>
        <div v-if="document?.openAlexId" class="response">
            <identifier-link :identifier="document.openAlexId" type="open_alex" />
        </div>

        <div v-if="document?.webOfScienceId">
            Web of Science ID:
        </div>
        <div v-if="document?.webOfScienceId" class="response">
            <identifier-link :identifier="document.webOfScienceId" type="web_of_science" />
        </div>

        <div v-if="document?.handleId">
            Handle ID:
        </div>
        <div v-if="document?.handleId" class="response">
            <identifier-link :identifier="document.handleId" type="handle" />
        </div>

        <div v-if="document?.arxivId">
            ArXiv ID:
        </div>
        <div v-if="document?.arxivId" class="response">
            <identifier-link :identifier="document.arxivId" type="arxiv" />
        </div>

        <div v-if="document?.pubmedId">
            PubMed ID:
        </div>
        <div v-if="document?.pubmedId" class="response">
            <identifier-link :identifier="document.pubmedId" type="pubmed" />
        </div>

        <div v-if="document?.ssrnId">
            SSRN ID:
        </div>
        <div v-if="document?.ssrnId" class="response">
            <identifier-link :identifier="document.ssrnId" type="ssrn" />
        </div>

        <div v-if="document?.uris && document.uris.length > 0">
            {{ $t("uriInputLabel") }}:
        </div>
        <div v-if="document?.uris && document.uris.length > 0" class="response">
            <uri-list :uris="document.uris" />
        </div>

        <div v-if="document?.city && document.city.length > 0">
            {{ $t("cityLabel") }}:
        </div>
        <div v-if="document?.city && document.city.length > 0" class="response">
            {{ returnCurrentLocaleContent(document.city) }}
        </div>

        <div v-if="document?.geoSpaceDescription && document.geoSpaceDescription.length > 0">
            {{ $t("geoSpaceDescriptionLabel") }}:
        </div>
        <div v-if="document?.geoSpaceDescription && document.geoSpaceDescription.length > 0" class="response">
            {{ returnCurrentLocaleContent(document.geoSpaceDescription) }}
        </div>

        <div v-if="document?.chronologicalSpaceDescription && document.chronologicalSpaceDescription.length > 0">
            {{ $t("chronologicalSpaceDescriptionLabel") }}:
        </div>
        <div v-if="document?.chronologicalSpaceDescription && document.chronologicalSpaceDescription.length > 0" class="response">
            {{ returnCurrentLocaleContent(document.chronologicalSpaceDescription) }}
        </div>

        <div v-if="document?.peerReviewed !== undefined">
            {{ $t("peerReviewedLabel") }}:
        </div>
        <div v-if="document?.peerReviewed !== undefined" class="response">
            {{ document.peerReviewed ? $t('yesLabel') : $t('noLabel') }}
        </div>

        <div v-if="document?.openAccess !== undefined">
            {{ $t("openAccessLabel") }}:
        </div>
        <div v-if="document?.openAccess !== undefined" class="response">
            {{ document.openAccess ? $t('yesLabel') : $t('noLabel') }}
        </div>

        <div v-if="document?.publicationStatus">
            {{ $t("publicationStatusLabel") }}:
        </div>
        <div v-if="document?.publicationStatus" class="response">
            {{ getPublicationStatusTitleFromValueAutoLocale(document.publicationStatus) }}
        </div>

        <div>
            <entity-identifiers-list
                :entity-identifiers="documentIdentifiers"
                :can-edit="canEdit"
                :entity-id="document?.id" 
                :containing-entity-type="containingEntityType"
                :concrete-entity-type="concreteEntityType"
                @updated="handleIdentifiersUpdated"
            />
        </div>
    </v-col>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import UriList from '@/components/core/UriList.vue';
import { getPublicationStatusTitleFromValueAutoLocale } from '@/i18n/publicationStatus';
import { ApplicableEntityType } from '@/models/Common';
import type { Document } from '@/models/PublicationModel';
import EntityIdentifiersList from '../core/identifiers/EntityIdentifiersList.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "DocumentCommonFieldsDisplay",
    components: { IdentifierLink, UriList, EntityIdentifiersList },
    props: {
        document: {
            type: Object as PropType<Document | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        containingEntityType: {
            type: String as PropType<ApplicableEntityType>,
            required: true
        },
        concreteEntityType: {
            type: String as PropType<ApplicableEntityType>,
            required: true
        },
        documentIdentifiers: {
            type: Array<EntityIdentifierResponse>,
            default: () => []
        }
    },
    emits: ["identifiers-updated"],
    setup(_, { emit }) {
        const handleIdentifiersUpdated = () => {
            emit("identifiers-updated");
        };

        return {
            getPublicationStatusTitleFromValueAutoLocale,
            ApplicableEntityType, handleIdentifiersUpdated,
            returnCurrentLocaleContent
        };
    }
});
</script>

<style scoped>

.response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

</style>
