<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-contribution-update-modal :read-only="readOnly" :preset-document-contributions="contributionList" @update="sendToParent"></publication-contribution-update-modal>

                    <div><b>{{ $t("authorsLabel") }}</b></div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    
                    <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
                        <localized-link :to="'persons/' + contribution.personId">
                            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isMainContributor ? ` (${$t("mainContributorLabel")})` : "") + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") + ` - ${getTitleFromValueAutoLocale(contribution.contributionType, $i18n.locale)}` }}</strong></h4>
                        </localized-link>
                        <h5 v-if="contribution.contact?.contactEmail">
                            <strong>{{ `${$t("emailLabel")}: ${contribution.contact?.contactEmail}` }}</strong>
                        </h5>
                        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import PublicationContributionUpdateModal from '@/components/publication/update/PublicationContributionUpdateModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/documentContributionType';


export default defineComponent({
    name: "PersonDocumentContributionList",
    components: { LocalizedLink, PublicationContributionUpdateModal },
    props: {
        contributionList: {
            type: Array as PropType<PersonDocumentContribution[]>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        },
    },
    emits: ["update"],
    setup(_, { emit }) {
        const sendToParent = (contributions: any[]) => {
            emit("update", contributions);
        };

        return { sendToParent, getTitleFromValueAutoLocale };
    },
});
</script>
