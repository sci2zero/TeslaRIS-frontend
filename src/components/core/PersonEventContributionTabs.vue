<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <event-contribution-update-modal :read-only="readOnly" :preset-event-contributions="contributionList" @update="sendToParent"></event-contribution-update-modal>

                    <div><b>{{ $t("contributionsLabel") }}</b></div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        
                    <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
                        <localized-link :to="'persons/' + contribution.personId">
                            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname }}</strong></h4>
                        </localized-link>
                        <p>{{ getTitleFromValueAutoLocale(contribution.eventContributionType, $i18n.locale) }}</p>
                        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import EventContributionUpdateModal from '../event/update/EventContributionUpdateModal.vue';
import type { PersonEventContribution } from '@/models/EventModel';
import { getTitleFromValueAutoLocale } from '@/i18n/eventContributionType';

export default defineComponent({
    name: "PersonEventContributionTabs",
    components: { LocalizedLink, EventContributionUpdateModal },
    props: {
        contributionList: {
            type: Array as PropType<PersonEventContribution[]>,
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
