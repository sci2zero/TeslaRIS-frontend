<template>
    <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
        <localized-link :to="'persons/' + contribution.personId">
            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname }}</strong></h4>
        </localized-link>
        <p>{{ getTitleFromValueAutoLocale(contribution.eventContributionType, $i18n.locale) }}</p>
        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/eventContributionType';
import type { PersonEventContribution } from '@/models/EventModel';


export default defineComponent({
    name: "PersonEventContributionList",
    components: { LocalizedLink },
    props: {
        contributionList: {
            type: Array as PropType<PersonEventContribution[]>,
            required: true
        }
    },
    setup() {

        return { getTitleFromValueAutoLocale };
    },
});
</script>
