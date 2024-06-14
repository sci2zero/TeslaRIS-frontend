<template>
    <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
        <localized-link :to="'persons/' + contribution.personId">
            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname }}</strong></h4>
        </localized-link>
        <p>{{ contribution.dateFrom ? `${localiseDate(contribution.dateFrom)} - ${contribution.dateTo ? localiseDate(contribution.dateTo) : $t("presentLabel")}` : $t("currentLabel") }}</p>
        <p>{{ getTitleFromValueAutoLocale(contribution.contributionType) }}</p>
        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getTitleFromValueAutoLocale } from '@/i18n/publicationSeriesContributionType';
import { localiseDate } from '@/i18n/dateLocalisation';


export default defineComponent({
    name: "PersonPublicationSeriesContributionList",
    components: { LocalizedLink },
    props: {
        contributionList: {
            type: Array as PropType<PersonPublicationSeriesContribution[]>,
            required: true
        }
    },
    setup() {
        return { getTitleFromValueAutoLocale, localiseDate };
    },
});
</script>
