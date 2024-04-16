<template>
    <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
        <localized-link :to="'persons/' + contribution.personId">
            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isMainContributor ? ` (${$t("mainContributorLabel")})` : "") + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") + ` - ${getTitleFromValueAutoLocale(contribution.contributionType, $i18n.locale)}` }}</strong></h4>
        </localized-link>
        <h5 v-if="contribution.contact?.contactEmail">
            <strong>{{ `${$t("emailLabel")}: ${contribution.contact?.contactEmail}` }}</strong>
        </h5>
        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/documentContributionType';
import type { PersonDocumentContribution } from '@/models/PublicationModel';


export default defineComponent({
    name: "PersonDocumentContributionList",
    components: { LocalizedLink },
    props: {
        contributionList: {
            type: Array as PropType<PersonDocumentContribution[]>,
            required: true
        }
    },
    setup() {

        return { getTitleFromValueAutoLocale };
    },
});
</script>
