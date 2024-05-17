<template>
    <draggable :list="contributionList" item-key="id" @change="reorderContributors">
        <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
            <localized-link elementk :to="'persons/' + contribution.personId">
                <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname }}</strong></h4>
            </localized-link>
            <p>{{ getTitleFromValueAutoLocale(contribution.eventContributionType) }}</p>
            <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
        </div>
    </draggable>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/eventContributionType';
import type { PersonEventContribution } from '@/models/EventModel';
import { VueDraggableNext } from 'vue-draggable-next'
import EventService from '@/services/EventService';


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
        }
    },
    setup(props) {
        const reorderContributors = (event: any) => {
            if(event.moved.newIndex !== event.moved.oldIndex) {
                EventService.reorderContribution(props.eventId as number, props.contributionList[event.moved.newIndex].id as number, event.moved.oldIndex + 1, event.moved.newIndex + 1);
            }
        };

        return { getTitleFromValueAutoLocale, reorderContributors };
    },
});
</script>
