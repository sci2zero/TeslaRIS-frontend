<template>
    <v-col :cols="cols" class="pa-0">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="document?.scopusId">
                <label class="block text-sm font-medium text-gray-700">Scopus ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.scopusId" type="scopus" />
                </p>
            </div>

            <div v-if="document?.doi">
                <label class="block text-sm font-medium text-gray-700">DOI</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.doi" />
                </p>
            </div>

            <div v-if="document?.openAlexId">
                <label class="block text-sm font-medium text-gray-700">Open Alex ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.openAlexId" type="open_alex" />
                </p>
            </div>

            <div v-if="document?.webOfScienceId">
                <label class="block text-sm font-medium text-gray-700">Web of Science ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.webOfScienceId" type="web_of_science" />
                </p>
            </div>

            <div v-if="document?.handleId">
                <label class="block text-sm font-medium text-gray-700">Handle ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.handleId" type="handle" />
                </p>
            </div>

            <div v-if="document?.arxivId">
                <label class="block text-sm font-medium text-gray-700">ArXiv ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.arxivId" type="arxiv" />
                </p>
            </div>

            <div v-if="document?.pubmedId">
                <label class="block text-sm font-medium text-gray-700">PubMed ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.pubmedId" type="pubmed" />
                </p>
            </div>

            <div v-if="document?.ssrnId">
                <label class="block text-sm font-medium text-gray-700">SSRN ID</label>
                <p class="mt-1 text-sm text-gray-900">
                    <identifier-link :identifier="document.ssrnId" type="ssrn" />
                </p>
            </div>

            <div v-if="document?.uris && document.uris.length > 0">
                <label class="block text-sm font-medium text-gray-700">{{ $t("uriInputLabel") }}</label>
                <div class="mt-1 text-sm text-gray-900">
                    <uri-list :uris="document.uris" />
                </div>
            </div>

            <div v-if="document?.city && document.city.length > 0">
                <label class="block text-sm font-medium text-gray-700">{{ $t("cityLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ returnCurrentLocaleContent(document.city) }}
                </p>
            </div>

            <div v-if="document?.geoSpaceDescription && document.geoSpaceDescription.length > 0">
                <label class="block text-sm font-medium text-gray-700">{{ $t("geoSpaceDescriptionLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ returnCurrentLocaleContent(document.geoSpaceDescription) }}
                </p>
            </div>

            <div v-if="document?.chronologicalSpaceDescription && document.chronologicalSpaceDescription.length > 0">
                <label class="block text-sm font-medium text-gray-700">{{ $t("chronologicalSpaceDescriptionLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ returnCurrentLocaleContent(document.chronologicalSpaceDescription) }}
                </p>
            </div>

            <div v-if="document?.edition && document.edition.length > 0">
                <label class="block text-sm font-medium text-gray-700">{{ $t("editionLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ returnCurrentLocaleContent(document.edition) }}
                </p>
            </div>

            <div v-if="isAdmin && document?.peerReviewed !== undefined">
                <label class="block text-sm font-medium text-gray-700">{{ $t("peerReviewedLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ document.peerReviewed ? $t('yesLabel') : $t('noLabel') }}
                </p>
            </div>

            <div v-if="isAdmin && document?.openAccess !== undefined">
                <label class="block text-sm font-medium text-gray-700">{{ $t("isOpenAccessLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ document.openAccess ? $t('yesLabel') : $t('noLabel') }}
                </p>
            </div>

            <div v-if="document?.publicationStatus">
                <label class="block text-sm font-medium text-gray-700">{{ $t("publicationStatusLabel") }}</label>
                <p class="mt-1 text-sm text-gray-900">
                    {{ getPublicationStatusTitleFromValueAutoLocale(document.publicationStatus) }}
                </p>
            </div>
        </div>

        <div class="mt-4">
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
import { useUserRole } from '@/composables/useUserRole.js';


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
        },
        cols: {
            type: Number,
            default: 6
        }
    },
    emits: ["identifiers-updated"],
    setup(_, { emit }) {
        const handleIdentifiersUpdated = () => {
            emit("identifiers-updated");
        };

        const { isAdmin } = useUserRole();

        return {
            getPublicationStatusTitleFromValueAutoLocale,
            ApplicableEntityType, handleIdentifiersUpdated,
            returnCurrentLocaleContent, isAdmin
        };
    }
});
</script>
