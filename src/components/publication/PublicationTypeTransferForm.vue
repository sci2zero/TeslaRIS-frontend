<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-if="transferTo === PublicationType.JOURNAL_PUBLICATION">
            <v-col>
                <journal-autocomplete-search
                    ref="journalAutocompleteRef"
                    v-model="selectedJournal"
                    required
                />
            </v-col>
        </v-row>

        <v-row v-if="transferTo === PublicationType.PROCEEDINGS_PUBLICATION">
            <v-col cols="11">
                <event-autocomplete-search
                    ref="eventAutocompleteRef"
                    v-model="selectedEvent"
                    required
                />
            </v-col>
        </v-row>
        <v-row v-if="selectedEvent && selectedEvent.value != -1 && myPublications.length > 0">
            <v-col>
                <h3>{{ $t("recentPublicationsLabel") }}</h3>
                <p
                    v-for="(publication) in myPublications"
                    :key="publication.id"
                    :value="publication"
                >
                    {{ returnCurrentLocaleContent(publication.title) + ` ${$t("inLabel")} ` + returnCurrentLocaleContent(publication.proceedingsTitle) }}
                </p>
            </v-col>
        </v-row>

        <v-row v-if="transferTo === PublicationType.PROCEEDINGS_PUBLICATION">
            <v-col cols="10">
                <v-select
                    v-model="selectedProceedings"
                    :items="availableProceedings"
                    :label="$t('proceedingsLabel') + '*'"
                    :no-data-text="(selectedEvent && selectedEvent.value === -1) ? $t('selectConferenceMessage') : $t('noAvailableProceedingsMessage')"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
            <v-col>
                <generic-crud-modal
                    :form-component="ProceedingsSubmissionForm"
                    :form-props="{
                        conference: selectedEvent ? selectedEvent : searchPlaceholder,
                        presetName: `Proceedings of: ${selectedEvent.title.split('|')[0].trim()}`
                    }"
                    entity-name="Proceedings"
                    is-submission
                    :read-only="!selectedEvent || selectedEvent.value === -1"
                    @create="selectNewlyAddedProceedings"
                />
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import { type ProceedingsPublicationResponse, PublicationType } from '@/models/PublicationModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import { useUserRole } from '@/composables/useUserRole';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import ProceedingsService from '@/services/ProceedingsService';
import type { Proceedings, ProceedingsResponse } from '@/models/ProceedingsModel';
import { useI18n } from 'vue-i18n';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ProceedingsSubmissionForm from '../proceedings/ProceedingsSubmissionForm.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import PublicationTypeTransferService from '@/services/PublicationTypeTransferService';
import { useRouter } from 'vue-router';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';


export default defineComponent({
    name: "PublicationTypeTransferForm",
    components: { JournalAutocompleteSearch, EventAutocompleteSearch, GenericCrudModal },
    props: {
        documentId: {
            type: Number,
            required: true
        },
        transferTo: {
            type: Object as PropType<PublicationType>,
            required: true
        }
    },
    setup(props) {
        const isFormValid = ref(false);

        const i18n = useI18n();
        const router = useRouter();

        const { isResearcher } = useUserRole();

        const { requiredSelectionRules } = useValidationUtils();

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);

        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<ProceedingsPublicationResponse[]>([]);

        watch(selectedEvent, (newValue) => {
            if (newValue) {
                if (isResearcher.value) {
                    listPublications(newValue);
                }
                availableProceedings.value = [];
                selectedProceedings.value = searchPlaceholder;
                fetchProceedings(newValue);
            }
        });

        const listPublications = (event: { title: string, value: number }) => {
            if (event.value > 0) {
                DocumentPublicationService.findMyPublicationsInEvent(event.value).then((response) => {
                    myPublications.value = response.data;
                });
            }
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            if (event.value <= 0) {
                return;
            }

            ProceedingsService.readProceedingsForEvent(event.value).then((response) => {
                response.data.forEach((proceedingsResponse: ProceedingsResponse) => {
                    let title: string | undefined;
                    proceedingsResponse.title.forEach(multilingualContent => {
                        if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                            title = multilingualContent.content;
                            return;
                        }
                    });
                    if (!title && proceedingsResponse.title.length > 0) {
                        title = proceedingsResponse.title[0].content;
                    }

                    if (proceedingsResponse.documentDate) {
                        availableProceedings.value.push({title: `${title} | ${proceedingsResponse.documentDate}`, value: proceedingsResponse.id as number });
                    } else {
                        availableProceedings.value.push({title: title as string, value: proceedingsResponse.id as number });
                    }
                });
            });
        };

        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const selectedProceedings = ref(searchPlaceholder);

        const selectNewlyAddedProceedings = (proceedings: Proceedings) => {
            let title: string | undefined;
            proceedings.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && proceedings.title.length > 0) {
                title = proceedings.title[0].content;
            }
            const toSelect = {title: `${title} | ${proceedings.documentDate}`, value: proceedings.id as number};
            availableProceedings.value.push(toSelect);
            selectedProceedings.value = toSelect;
        };

        const submit = async () => {
            if (props.transferTo === PublicationType.JOURNAL_PUBLICATION) {
                PublicationTypeTransferService.transferProceedingsPublicationToJournal(
                    props.documentId, selectedJournal.value.value
                ).then(response => {
                    router.push({ name: "journalPublicationLandingPage", params: {id: response.data as number} });
                });
            } else if (props.transferTo === PublicationType.PROCEEDINGS_PUBLICATION) {
                PublicationTypeTransferService.transferJournalPublicationToProceedings(
                    props.documentId, selectedProceedings.value.value
                ).then(response => {
                    router.push({ name: "proceedingsPublicationLandingPage", params: {id: response.data as number} });
                });
            }
        };

        return {
            isFormValid, submit,
            selectedJournal, selectedEvent,
            returnCurrentLocaleContent,
            availableProceedings,
            selectedProceedings,
            ProceedingsSubmissionForm,
            requiredSelectionRules,
            searchPlaceholder, myPublications,
            selectNewlyAddedProceedings,
            PublicationType
        };
    }
});
</script>
