<template>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedPerson"
                :label="$t('personLabel') + '*'"
                :items="persons"
                :custom-filter="filterPersons"
                :auto-select-first="true"
                :rules="requiredSelectionRules"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchPersons($event)"
                @update:model-value="onPersonSelect($event)"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" style="margin-top: 20px;">
            <person-submission-modal></person-submission-modal>
        </v-col>
    </v-row>
    <v-row v-if="personOtherNames.length > 0">
        <v-col v-if="!customNameInput" cols="10">
            <v-select
                v-model="selectedOtherName"
                :label="$t('personOtherNamesLabel')"
                :items="personOtherNames"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:model-value="sendContentToParent"
            ></v-select>
        </v-col>
        <v-col v-if="customNameInput" cols="3">
            <v-text-field v-model="firstName" :label="$t('firstNameLabel') + '*'" :placeholder="$t('firstNameLabel')" :rules="requiredFieldRules"></v-text-field>
        </v-col>
        <v-col v-if="customNameInput" cols="3">
            <v-text-field v-model="middleName" :label="$t('middleNameLabel') + '*'" :placeholder="$t('middleNameLabel')" :rules="requiredFieldRules"></v-text-field>
        </v-col>
        <v-col v-if="customNameInput" cols="3">
            <v-text-field v-model="lastName" :label="$t('surnameLabel') + '*'" :placeholder="$t('surnameLabel')" :rules="requiredFieldRules"></v-text-field>
        </v-col>
        <v-col cols="2" style="margin-top: 10px;">
            <v-btn color="primary" @click="customNameInput = !customNameInput">
                {{ !customNameInput ? $t("addCustomLabel") : $t("selectFromListLabel") }}
            </v-btn>
        </v-col>
    </v-row>
    <multilingual-text-input
        v-if="!basic" ref="descriptionRef" v-model="contributionDescription" :label="$t('descriptionLabel')"
        is-area></multilingual-text-input>
    <multilingual-text-input v-if="!basic" ref="affiliationStatementRef" v-model="affiliationStatement" :label="$t('affiliationStatementLabel')"></multilingual-text-input>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import PersonService from "@/services/PersonService";
import type { PersonIndex } from "@/models/PersonModel";
import { useI18n } from "vue-i18n";
import { useValidationUtils } from "@/utils/ValidationUtils";
import MultilingualTextInput from "./MultilingualTextInput.vue";
import lodash from "lodash";
import { watch } from "vue";
import type { PersonName } from "@/models/PersonModel";
import PersonSubmissionModal from "../person/PersonSubmissionModal.vue";

export default defineComponent({
    name: "PersonContributionBase",
    components: { MultilingualTextInput, PersonSubmissionModal },
    props: {
        basic: {
            type: Boolean,
            default: false
        }
    },
    emits: ["setInput"],
    setup(_, {emit}) {
        const contributionDescription = ref([]);
        const affiliationStatement = ref([]);

        const customNameInput = ref(false);
        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");

        const descriptionRef = ref<typeof MultilingualTextInput>();
        const affiliationStatementRef = ref<typeof MultilingualTextInput>();

        const persons = ref<{ title: string, value: number }[]>([]);
        const personPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(personPlaceholder);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const i18n = useI18n();
        const personOtherNamePlaceholder = ref({title: "", value: -1});

        const personOtherNames = ref<{ title: string, value: PersonName | number }[]>([]);
        const selectedOtherName = ref<{ title: string, value: PersonName | number }>(personOtherNamePlaceholder.value);

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
                PersonService.searchResearchers(params).then((response) => {
                    const listOfPersons: { title: string, value: number }[] = [];
                    response.data.content.forEach((person: PersonIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfPersons.push({title: `${person.name} | ${person.birthdate ? person.birthdate : "NA"} | ${person.employmentsSr}`, value: person.databaseId});
                        } else {
                            listOfPersons.push({title: `${person.name} | ${person.birthdate} | ${person.employmentsOther}`, value: person.databaseId});
                        }
                    })
                    persons.value = listOfPersons;
                });
            }
        }, 300);

        const filterPersons = (): boolean => {
            return true;
        };

        const onPersonSelect = (selection: {title: string, value: number}) => {
            PersonService.readPerson(selection.value).then((response) => {
                personOtherNames.value = [{title: selection.title.split("|")[0], value: -1}];
                selectedOtherName.value = personOtherNames.value[0];
                response.data.personOtherNames.forEach((otherName) => {
                    personOtherNames.value.push({title: `${otherName.firstname} ${otherName.otherName} ${otherName.lastname} | ${otherName.dateFrom} - ${otherName.dateTo}`, value: otherName as PersonName})
                });
            });
            sendContentToParent();
        };

        const sendContentToParent = () => {
            let otherName = ["", "", "", null, null];
            if (selectedOtherName.value && selectedOtherName.value?.value !== -1) {
                const personOtherName = selectedOtherName.value?.value as PersonName;
                otherName = [personOtherName.firstname, personOtherName.otherName, personOtherName.lastname, personOtherName.dateFrom as string, personOtherName.dateTo as string];
            }
            if (customNameInput.value) {
                otherName = [firstName.value, middleName.value, lastName.value, null, null]
            }
            const returnObject = {
                personId: selectedPerson.value.value,
                description: contributionDescription.value,
                affiliationStatement: affiliationStatement.value,
                selectedOtherName: otherName
            };
            emit("setInput", returnObject);
        };

        watch(contributionDescription, () => sendContentToParent());
        watch(affiliationStatement, () => sendContentToParent());

        const clearInput = () => {
            selectedPerson.value = personPlaceholder;
            descriptionRef.value?.clearInput();
            affiliationStatementRef.value?.clearInput();
            personOtherNames.value = [];
        };

        return {persons,
                firstName, middleName, lastName,
                selectedPerson, customNameInput,
                searchPersons, filterPersons,
                requiredFieldRules, requiredSelectionRules,
                contributionDescription, affiliationStatement,
                sendContentToParent, clearInput, onPersonSelect,
                descriptionRef, affiliationStatementRef,
                personOtherNames, selectedOtherName};
    }
});
</script>
