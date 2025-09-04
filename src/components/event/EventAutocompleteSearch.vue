<template>
    <v-row>
        <v-col :cols="(allowManualClearing && hasSelection ? 10 : 11) + ((disableSubmission || readOnly) ? 1 : 0)">
            <v-autocomplete
                v-model="selectedEvent"
                :readonly="readOnly"
                :label="(multiple ? $t('conferenceListLabel') : $t('conferenceLabel')) + (required ? '*' : '')"
                :items="readOnly ? [] : events"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :multiple="multiple"
                return-object
                @update:search="searchEvents($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col v-if="!disableSubmission && !readOnly" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="ConferenceSubmissionForm"
                :form-props="{readOnly: readOnly, presetName: lastSearchInput}"
                entity-name="Conference"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedEvent"
            />
        </v-col>
        <v-col v-if="allowManualClearing && hasSelection" cols="1">
            <v-btn icon @click="clearInput">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, computed, type PropType, ref, onMounted } from 'vue';
import lodash from "lodash";
import EventService from '@/services/EventService';
import type { Conference, EventIndex } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { useValidationUtils } from '@/utils/ValidationUtils';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ConferenceSubmissionForm from './ConferenceSubmissionForm.vue';
import { localiseDate } from '@/utils/DateUtil';


export default defineComponent({
    name: "EventAutocompleteSearch",
    components: { GenericCrudModal },
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        returnOnlyNonSerialEvents: {
            type: Boolean,
            default: true
        },
        returnOnlySerialEvents: {
            type: Boolean,
            default: false
        },
        multiple: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: [Object, Array] as PropType<{ title: string, value: number } | { title: string, value: number }[] | undefined>,
            required: true,
        },
        disableSubmission: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const i18n = useI18n();
        const searchPlaceholder = props.multiple ? [] : { title: "", value: -1 };

        const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);
        
        const events = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedEvent = ref(
            props.multiple ? (props.modelValue as any[] || []) : (props.modelValue || searchPlaceholder)
        );

        const lastSearchInput = ref("");

        onMounted(() => {
            if (props.modelValue) {
                selectedEvent.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchEvents = lodash.debounce((input: string) => {
            if (!input || input.includes("|")) {
                return;
            }

            if (input.length >= 3) {
                if (!input.startsWith(i18n.t("notInListLabel", []).slice(0, -3))) {
                    lastSearchInput.value = input;
                }

                const params = "tokens=" + input.split(" ").join("&tokens=") + "&page=0&size=5";
                EventService.searchConferences(params, props.returnOnlyNonSerialEvents, props.returnOnlySerialEvents, false, false).then((response) => {
                    events.value = response.data.content.map((conference: EventIndex) => ({
                        title: `${i18n.locale.value.startsWith("sr") ? conference.nameSr : conference.nameOther} | ${conference.dateFromTo}`,
                        value: conference.databaseId,
                        date: conference.dateFromTo
                    }));

                    if (!props.multiple && !props.disableSubmission && !props.readOnly && !modalRef.value!.dialog) {
                        events.value.push({
                            title: i18n.t("notInListLabel", [input]),
                            value: 0,
                            date: undefined
                        });
                    }
                });
            }
        }, 300);

        watch(selectedEvent, () => {
            if (
                !props.multiple &&
                selectedEvent.value &&
                (selectedEvent.value as { title: string; value: number; }).value === 0
            ) {
                modalRef.value!.dialog = true;
                (selectedEvent.value as { title: string; value: number; }).title = "";
                (selectedEvent.value as { title: string; value: number; }).value = -1;
            }
        });

        const sendContentToParent = () => {
            emit("update:modelValue", selectedEvent.value);
        };

        watch(() => props.modelValue, () => {
            if (props.modelValue) {
                selectedEvent.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedEvent.value = searchPlaceholder;
            sendContentToParent();
        };

        const hasSelection = computed(() =>
            props.multiple ? (selectedEvent.value as any[]).length > 0 : (selectedEvent.value as { title: '', value: -1 }).value !== -1
        );

        const selectNewlyAddedEvent = (event: Conference) => {
            let title = event.name.find(m => m.languageTag === i18n.locale.value.toUpperCase())?.content || event.name[0].content;
            const abbreviation = event.nameAbbreviation.find(m => m.languageTag === i18n.locale.value.toUpperCase())?.content || event.nameAbbreviation[0]?.content;
            
            if (abbreviation) {
                title += ` ${abbreviation}`;
            }

            const toSelect = { title: `${title} | ${extractDate(event)}`, value: event.id as number };
            events.value.push(toSelect);
            
            if (props.multiple) {
                (selectedEvent.value as any[]).push(toSelect);
            } else {
                selectedEvent.value = toSelect;
            }
            sendContentToParent();
        };

        const extractDate = (event: Conference): string => {
            if (event.serialEvent) {
                return i18n.t("serialEventLabel");
            }

            const dateFrom = new Date(Date.parse(event.dateFrom));
            const dateTo = new Date(Date.parse(event.dateTo));
            if (monthDiff(dateFrom, dateTo) > 2) {
                return `${dateFrom.getFullYear()}`;
            }

            return `${localiseDate(event.dateFrom)} - ${localiseDate(event.dateTo)}`
        };

        const monthDiff = (dateFrom: Date, dateTo: Date) => {
            return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
        };

        return {
            events, selectedEvent, searchEvents,
            requiredSelectionRules, sendContentToParent,
            clearInput, selectNewlyAddedEvent, hasSelection,
            ConferenceSubmissionForm, lastSearchInput, modalRef
        };
    }
});
</script>
