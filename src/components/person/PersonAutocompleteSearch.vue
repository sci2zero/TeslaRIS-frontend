<template>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedPerson"
                :label="$t('personLabel') + '*'"
                :items="persons"
                :custom-filter="((): boolean => true)"
                :auto-select-first="true"
                :rules="requiredSelectionRules"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchPersons($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" class="modal-spacer-top">
            <person-submission-modal @create="selectNewlyAddedPerson"></person-submission-modal>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import PersonService from '@/services/PersonService';
import type { BasicPerson, PersonIndex } from '@/models/PersonModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { removeTrailingPipeRegex } from '@/utils/StringUtil';
import { localiseDate } from '@/i18n/dateLocalisation';
import PersonSubmissionModal from './PersonSubmissionModal.vue';


export default defineComponent({
    name: "PersonAutocompleteSearch",
    components: { PersonSubmissionModal },
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
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        },
        returnOnlyNonSerialPersons: {
            type: Boolean,
            default: true
        },
        returnOnlySerialPersons: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const persons = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedPerson.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

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
                PersonService.searchResearchers(params, false).then((response) => {
                    const listOfPersons: { title: string, value: number }[] = [];
                    response.data.content.forEach((person: PersonIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfPersons.push({title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsSr}`), value: person.databaseId});
                        } else {
                            listOfPersons.push({title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsOther}`), value: person.databaseId});
                        }
                    })
                    persons.value = listOfPersons;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            console.log(selectedPerson.value)
            emit("update:modelValue", selectedPerson.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedPerson.value = props.modelValue;
            }
        });

        const selectNewlyAddedPerson = (person: BasicPerson) => {
            const toSelect = {title: `${person.personName.firstname} ${person.personName.otherName} ${person.personName.lastname} | ${person.localBirthDate ? localiseDate(person.localBirthDate) : i18n.t("unknownBirthdateMessage")}`, value: person.id as number};
            persons.value.push(toSelect);
            selectedPerson.value = toSelect;
            sendContentToParent();
        };

        return {
            persons, selectedPerson, searchPersons,
            requiredSelectionRules,
            sendContentToParent,
            selectNewlyAddedPerson
        };
    }
});
</script>
