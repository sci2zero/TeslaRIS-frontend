<template>
    <draggable
        :list="contributionList" item-key="id"
        group="fundingCallContributions"
        :disabled="!canReorder"
        @change="reorderContributors"
    >
        <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
            <localized-link v-if="contribution.personId" :to="'persons/' + contribution.personId">
                <h4>
                    <strong>
                        {{ contribution.personName?.firstname }}
                        {{ contribution.personName?.otherName ? ' ' + contribution.personName.otherName : '' }}
                        {{ ' ' + contribution.personName?.lastname }}
                        {{ displayContributionType(contribution) }}
                    </strong>
                </h4>
            </localized-link>
            <h4 v-else>
                <strong>
                    {{ contribution.personName?.firstname }}
                    {{ contribution.personName?.otherName ? ' ' + contribution.personName.otherName : '' }}
                    {{ ' ' + contribution.personName?.lastname }}
                    {{ displayContributionType(contribution) }}
                </strong>
            </h4>

            <p>{{ contribution.dateFrom ? `${localiseDate(contribution.dateFrom)} - ${contribution.dateTo ? localiseDate(contribution.dateTo) : $t("presentLabel")}` : $t("currentLabel") }}</p>
            <div v-if="contribution.institutionIds?.length === 0">
                <em>
                    {{ returnCurrentLocaleContent(contribution.displayAffiliationStatement) }}
                </em>
            </div>
            <div v-for="(mc, idx) in contribution.displayInstitutionNames" v-else :key="idx">
                <em>
                    {{ returnCurrentLocaleContent(mc) }}
                </em>
            </div>
            <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10" />
        </div>
    </draggable>
    <strong
        v-if="!contributionList || contributionList.length === 0"
        class="mt-15">
        {{ $t("notYetSetMessage") }}
    </strong>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import type { PersonFundingCallContribution } from '@/models/FundingCallModel';
import { getTitleFromValueAutoLocale } from '@/i18n/fundingCallContributionType';
import { localiseDate } from '@/utils/DateUtil';
import { VueDraggableNext } from 'vue-draggable-next'
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "PersonFundingCallContributionList",
    components: { LocalizedLink, draggable: VueDraggableNext },
    props: {
        contributionList: {
            type: Array as PropType<PersonFundingCallContribution[]>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        canReorder: {
            type: Boolean,
            default: false
        }
    },
    emits: ["positionsChanged"],
    setup(props, {emit}) {
        const reorderContributors = (event: any) => {
            if(event.moved.newIndex !== event.moved.oldIndex) {
                emit("positionsChanged");
            }
        };

        const displayContributionType = (contribution: PersonFundingCallContribution) => {
            if (!props.inComparator) {
                return "";
            }

            return ` - ${getTitleFromValueAutoLocale(contribution.contributionType)}`;
        };

        return {
            getTitleFromValueAutoLocale,
            localiseDate, reorderContributors,
            returnCurrentLocaleContent,
            displayContributionType
        };
    },
});
</script>
