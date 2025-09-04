<template>
    <draggable
        :list="contributionList" item-key="id"
        group="eventContributions"
        :disabled="!canReorder"
        @change="reorderContributors">
        <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
            <localized-link v-if="contribution.personId" elementk :to="'persons/' + contribution.personId">
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
import { getTitleFromValueAutoLocale } from '@/i18n/eventContributionType';
import type { PersonEventContribution } from '@/models/EventModel';
import { VueDraggableNext } from 'vue-draggable-next'
import EventService from '@/services/EventService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "PersonEventContributionList",
    components: { LocalizedLink, draggable: VueDraggableNext },
    props: {
        contributionList: {
            type: Array as PropType<PersonEventContribution[]>,
            required: true
        },
        eventId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        canReorder: {
            type: Boolean,
            default: false
        },
        inComparator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["positionsChanged"],
    setup(props, {emit}) {
        const reorderContributors = (event: any) => {
            if(event.moved.newIndex !== event.moved.oldIndex) {
                EventService.reorderContribution(
                    props.eventId as number,
                    props.contributionList[event.moved.newIndex].id as number,
                    event.moved.oldIndex + 1,
                    event.moved.newIndex + 1
                ).then(() => {
                    emit("positionsChanged")
                });
            }
        };

        const displayContributionType = (contribution: PersonEventContribution) => {
            if (!props.inComparator) {
                return "";
            }

            return ` - ${getTitleFromValueAutoLocale(contribution.eventContributionType)}`;
        };

        return {
            getTitleFromValueAutoLocale, reorderContributors,
            returnCurrentLocaleContent, displayContributionType
        };
    },
});
</script>
