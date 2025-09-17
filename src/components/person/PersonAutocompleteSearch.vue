<template>
    <v-row>
        <v-col :cols="(allowManualClearing && hasSelection ? 10 : 11) + (disableSubmission ? 1 : 0)">
            <v-autocomplete
                v-model="selectedPerson"
                v-model:search="searchInput"
                :label="(label ? $t(label) : (multiple ? $t('personListLabel') : $t('personLabel'))) + (required ? '*' : '')"
                :items="readOnly ? [] : persons"
                :custom-filter="((): boolean => true)"
                :rules="required ? (multiple ? requiredMultiSelectionRules : requiredSelectionRules) : []"
                :no-data-text="$t('noDataMessage')"
                :multiple="multiple"
                return-object
                :readonly="readOnly"
                @update:search="searchPersons($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col v-if="!disableSubmission" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="PersonSubmissionForm"
                entity-name="Person"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedPerson"
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
import { defineComponent, watch, type PropType } from 'vue';
import { ref, computed } from 'vue';
import lodash from "lodash";
import PersonService from '@/services/PersonService';
import type { BasicPerson, PersonIndex } from '@/models/PersonModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { removeTrailingPipeRegex } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import PersonSubmissionForm from './PersonSubmissionForm.vue';


export default defineComponent({
    name: "PersonAutocompleteSearch",
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
        multiple: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: [Object, Array] as PropType<
                { title: string, value: number } | { title: string, value: number }[] | undefined
            >,
            required: true,
        },
        institutionId: {
            type: Number,
            default: 0
        },
        disableSubmission: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ""
        },
        onlyHarvestable: {
            type: Boolean,
            default: false
        },
        noOrcid: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = props.multiple ? [] : {title: "", value: -1};

        const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

        const persons = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedPerson = ref(
            props.multiple ? (props.modelValue as any[] || []) : (props.modelValue || searchPlaceholder)
        );
        const searchInput = ref("");

        onMounted(() => {
            if (props.modelValue) {
                selectedPerson.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules, requiredMultiSelectionRules } = useValidationUtils();

        const searchPersons = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                PersonService.searchResearchersFromInstitution(
                    params, false,
                    props.institutionId,
                    props.onlyHarvestable,
                    props.noOrcid
                ).then((response) => {
                    const listOfPersons: { title: string, value: number }[] = [];
                    response.data.content.forEach((person: PersonIndex) => {
                        if (i18n.locale.value.startsWith("sr")) {
                            listOfPersons.push({title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsSr}`), value: person.databaseId});
                        } else {
                            listOfPersons.push({title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsOther}`), value: person.databaseId});
                        }
                    });

                    if (!props.multiple && !props.disableSubmission && !modalRef.value!.dialog) {
                        listOfPersons.push({
                            title: i18n.t("notInListLabel", [input]),
                            value: 0
                        });
                    }

                    persons.value = listOfPersons;
                });
            }
        }, 300);

        watch(selectedPerson, () => {
            if (
                !props.multiple &&
                selectedPerson.value &&
                (selectedPerson.value as { title: string; value: number; }).value === 0
            ) {
                modalRef.value!.dialog = true;
                (selectedPerson.value as { title: string; value: number; }).title = "";
                (selectedPerson.value as { title: string; value: number; }).value = -1;
            }
        });

        const sendContentToParent = () => {
            if (props.multiple) {
                searchInput.value = "";
            }
            
            emit("update:modelValue", selectedPerson.value);
        };

        watch(() => props.modelValue, () => {
            if (props.modelValue) {
                selectedPerson.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedPerson.value = searchPlaceholder;
            sendContentToParent();
        };

        const hasSelection = computed(() =>
            props.multiple ? (selectedPerson.value as any[]).length > 0 : (selectedPerson.value as { title: '', value: -1 }).value !== -1
        );

        const selectNewlyAddedPerson = (person: BasicPerson) => {
            const toSelect = {title: `${person.personName.firstname} ${person.personName.otherName} ${person.personName.lastname} | ${person.localBirthDate ? localiseDate(person.localBirthDate) : i18n.t("unknownBirthdateMessage")}` , value: person.id as number};
            persons.value.push(toSelect);

            if (props.multiple) {
                (selectedPerson.value as any[]).push(toSelect);
            } else {
                selectedPerson.value = toSelect;
            }
            sendContentToParent();
        };

        return {
            persons, selectedPerson, searchPersons,
            requiredSelectionRules, sendContentToParent,
            clearInput, selectNewlyAddedPerson, hasSelection,
            PersonSubmissionForm, requiredMultiSelectionRules,
            modalRef, searchInput
        };
    }
});
</script>
