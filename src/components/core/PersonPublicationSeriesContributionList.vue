<template>
    <draggable 
        :list="contributionList" item-key="id"
        group="publicationContributions"
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
            <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
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
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getTitleFromValueAutoLocale } from '@/i18n/publicationSeriesContributionType';
import { localiseDate } from '@/utils/DateUtil';
import { VueDraggableNext } from 'vue-draggable-next'
import PublicationSeriesService from '@/services/PublicationSeriesService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "PersonPublicationSeriesContributionList",
    components: { LocalizedLink, draggable: VueDraggableNext },
    props: {
        contributionList: {
            type: Array as PropType<PersonPublicationSeriesContribution[]>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        publicationSeriesId: {
            type: Object as PropType<number | undefined>,
            required: true
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
                PublicationSeriesService.reorderContribution(
                    props.publicationSeriesId as number,
                    props.contributionList[event.moved.newIndex].id as number,
                    event.moved.oldIndex + 1,
                    event.moved.newIndex + 1
                ).then(() => {
                    emit("positionsChanged")
                });
            }
        };

        const displayContributionType = (contribution: PersonPublicationSeriesContribution) => {
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
