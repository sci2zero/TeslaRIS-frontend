<template>
    <v-row v-if="!selectExternalAssociate">
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedPerson"
                :label="$t('personLabel') + '*'"
                :items="persons"
                :custom-filter="filterPersons"
                :rules="requiredSelectionRules"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchPersons($event)"
                @update:model-value="onPersonSelect($event)"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <generic-crud-modal
                :form-component="PersonSubmissionForm"
                entity-name="Person"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedPerson"
            />
        </v-col>
    </v-row>
    <v-btn
        v-if="allowExternalAssociate && !selectExternalAssociate"
        color="primary"
        class="text-body-2 mb-2"
        @click="toggleExternalSelection">
        {{ $t("addExternalAssociateLabel") }}
    </v-btn>
    <v-row v-if="personOtherNames.length > 0 || selectExternalAssociate">
        <v-col v-if="!customNameInput && !selectExternalAssociate" cols="10">
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
        <v-col v-if="customNameInput || selectExternalAssociate" cols="3">
            <v-text-field
                v-model="firstName" :label="$t('firstNameLabel') + '*'" :placeholder="$t('firstNameLabel')" :rules="requiredFieldRules"
                @update:model-value="sendContentToParent"></v-text-field>
        </v-col>
        <v-col v-if="customNameInput || selectExternalAssociate" cols="3">
            <v-text-field v-model="middleName" :label="$t('middleNameLabel')" :placeholder="$t('middleNameLabel')" @update:model-value="sendContentToParent"></v-text-field>
        </v-col>
        <v-col v-if="customNameInput || selectExternalAssociate" cols="3">
            <v-text-field
                v-model="lastName" :label="$t('surnameLabel') + '*'" :placeholder="$t('surnameLabel')" :rules="requiredFieldRules"
                @update:model-value="sendContentToParent"></v-text-field>
        </v-col>
        <v-col v-if="!selectExternalAssociate" cols="2" class="custom-label">
            <v-btn color="primary" class="text-body-2" @click="customNameInput = !customNameInput">
                {{ !customNameInput ? $t("addCustomLabel") : $t("selectFromListLabel") }}
            </v-btn>
        </v-col>
    </v-row>
    <v-btn
        v-if="allowExternalAssociate && selectExternalAssociate"
        color="primary"
        class="text-body-2 mb-2"
        @click="toggleExternalSelection">
        {{ $t("selectAssociateFromSystemLabel") }}
    </v-btn>
    <v-row v-show="personOtherNames.length > 0 && !enterExternalOU">
        <v-col cols="10">
            <v-select
                v-if="!selectExternalAssociate"
                v-model="selectedAffiliations"
                :label="$t('personAffiliationsLabel')"
                :items="personAffiliations"
                :no-data-text="$t('noAffiliationsMessage')"
                return-object
                multiple
                @update:model-value="sendContentToParent"
            ></v-select>
        </v-col>
    </v-row>
    <v-row v-show="(personOtherNames.length > 0 && enterExternalOU) || selectExternalAssociate">
        <v-col>
            <multilingual-text-input
                ref="affiliationStatementRef" v-model="affiliationStatement" :label="$t('affiliationStatementLabel')"
                :initial-value="toMultilingualTextInput(presetContributionValue.affiliationStatement, languageTags)"
                @update:model-value="sendContentToParent"></multilingual-text-input>
        </v-col>
    </v-row>
    <v-row v-if="personOtherNames.length > 0 && !selectExternalAssociate">
        <v-col>
            <v-btn color="primary" class="text-body-2 mb-2" @click="enterExternalOU = !enterExternalOU">
                {{ enterExternalOU ? $t("chooseFromListLabel") : $t("enterExternalOULabel") }}
            </v-btn>
        </v-col>
    </v-row>
    <!-- <v-row>
        <v-col>
            <multilingual-text-input
                v-if="!basic" ref="descriptionRef" v-model="contributionDescription" :label="$t('abstractLabel')"
                :initial-value="toMultilingualTextInput(presetContributionValue.description, languageTags)"
                is-area
                @update:model-value="sendContentToParent"></multilingual-text-input>
        </v-col>
    </v-row> -->
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import PersonService from "@/services/PersonService";
import type { BasicPerson, PersonIndex } from "@/models/PersonModel";
import { useI18n } from "vue-i18n";
import { useValidationUtils } from "@/utils/ValidationUtils";
import MultilingualTextInput from "./MultilingualTextInput.vue";
import lodash from "lodash";
import { watch } from "vue";
import type { PersonName } from "@/models/PersonModel";
import type { PropType } from "vue";
import type { LanguageTagResponse, MultilingualContent } from "@/models/Common";
import { returnCurrentLocaleContent, toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import { onMounted } from "vue";
import LanguageService from "@/services/LanguageService";
import InvolvementService from "@/services/InvolvementService";
import { localiseDate } from "@/i18n/dateLocalisation";
import { removeTrailingPipeRegex } from "@/utils/StringUtil";
import GenericCrudModal from "./GenericCrudModal.vue";
import PersonSubmissionForm from "../person/PersonSubmissionForm.vue";


export default defineComponent({
    name: "PersonContributionBase",
    components: { MultilingualTextInput, GenericCrudModal },
    props: {
        basic: {
            type: Boolean,
            default: false
        },
        presetContributionValue: {
            type: Object as PropType<{personId: number, description: MultilingualContent[], affiliationStatement: MultilingualContent[], selectedOtherName: string[], institutionIds: number[]}>,
            default: () => ({
                personId: -1,
                description: [],
                affiliationStatement: [],
                selectedOtherName: []
            })
        },
        allowExternalAssociate: {
            type: Boolean,
            default: true
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const contributionDescription = ref([]);
        const affiliationStatement = ref([]);

        const enterExternalOU = ref(true);

        const customNameInput = ref(false);
        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");

        const descriptionRef = ref<typeof MultilingualTextInput>();
        const affiliationStatementRef = ref<typeof MultilingualTextInput>();

        const persons = ref<{ title: string, value: number }[]>([]);
        const personPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(personPlaceholder);

        const selectedAffiliations = ref<{ title: string, value: number }[]>([]);
        const personAffiliations = ref<{ title: string, value: number }[]>([]);
        const presetAffiliations = ref<number[]>([]);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const i18n = useI18n();
        const personOtherNamePlaceholder = ref({title: "", value: -1});

        const personOtherNames = ref<{ title: string, value: PersonName | number }[]>([]);
        const selectedOtherName = ref<{ title: string, value: PersonName | number }>(personOtherNamePlaceholder.value);

        const languageTags = ref<LanguageTagResponse[]>([]);

        const valueSet = ref(false);

        const selectExternalAssociate = ref(false);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
        });

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
                PersonService.searchResearchers(params, false, null).then((response) => {
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

        const filterPersons = (): boolean => {
            return true;
        };

        watch(() => props.presetContributionValue, () => {
            if(props.presetContributionValue && !valueSet.value) {
                valueSet.value = true;

                if (props.presetContributionValue.affiliationStatement?.length === 0) {
                    enterExternalOU.value = false;
                }

                const selectedPersonName = props.presetContributionValue.selectedOtherName[0] + (props.presetContributionValue.selectedOtherName[1] && props.presetContributionValue.selectedOtherName[1].toLowerCase() !== "null" ? ` ${props.presetContributionValue.selectedOtherName[1]}` : "") + ` ${props.presetContributionValue.selectedOtherName[2]}`;
                presetAffiliations.value = props.presetContributionValue.institutionIds;

                firstName.value = props.presetContributionValue.selectedOtherName[0];
                middleName.value = props.presetContributionValue.selectedOtherName[1];
                lastName.value = props.presetContributionValue.selectedOtherName[2];

                if(props.presetContributionValue.personId) {
                    PersonService.readPerson(props.presetContributionValue.personId).then((personResponse) => {
                        
                        if (personResponse.data.personName.otherName && personResponse.data.personName.otherName !== "null") {
                            selectedPerson.value = {title: `${personResponse.data.personName.firstname} ${personResponse.data.personName.otherName} ${personResponse.data.personName.lastname}`, value: personResponse.data.id as number};
                        } else {
                            selectedPerson.value = {title: `${personResponse.data.personName.firstname} ${personResponse.data.personName.lastname}`, value: personResponse.data.id as number};
                        }

                        personOtherNames.value = [{title: selectedPerson.value.title, value: -1}];
                        personResponse.data.personOtherNames.forEach((otherName) => {
                            if (otherName.dateFrom && otherName.dateTo) {
                                personOtherNames.value.push({title: `${otherName.firstname} ${otherName.otherName} ${otherName.lastname} | ${otherName.dateFrom} - ${otherName.dateTo}`, value: otherName as PersonName});
                            } else {
                                personOtherNames.value.push({title: `${otherName.firstname} ${otherName.otherName} ${otherName.lastname}`, value: otherName as PersonName});
                            }
                        });

                        const foundName = personOtherNames.value.find(otherName => {
                            return otherName.title === selectedPersonName;
                        });

                        if(foundName) {
                            selectedOtherName.value = foundName;
                        } else if(selectedPersonName.trim() === "") {
                            customNameInput.value = false;
                            selectedOtherName.value = personOtherNames.value[0];
                        } else {
                            customNameInput.value = true;
                        }

                        sendContentToParent();
                    });
                } else {
                    customNameInput.value = true;
                    selectExternalAssociate.value = true;
                }
            }
        }, { deep: true });

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
                otherName = [
                    personOtherName.firstname,
                    personOtherName.otherName,
                    personOtherName.lastname,
                    personOtherName.dateFrom as string,
                    personOtherName.dateTo as string
                ];
            }

            if (customNameInput.value) {
                otherName = [firstName.value, middleName.value, lastName.value, null, null]
            }
            
            const returnObject = {
                personId: selectExternalAssociate.value ? -1 : selectedPerson.value.value,
                description: contributionDescription.value,
                affiliationStatement: (selectExternalAssociate.value || enterExternalOU.value) ? affiliationStatement.value : [],
                selectedOtherName: otherName,
                institutionIds: enterExternalOU.value ? [] : selectedAffiliations.value.map(affiliation => affiliation.value)
            };
            
            emit("setInput", returnObject);
        };

        watch(contributionDescription, () => sendContentToParent());
        watch(affiliationStatement, () => sendContentToParent());

        watch(selectedPerson, () => {
            InvolvementService.getPersonEmployments(selectedPerson.value.value).then((response) => {
                personAffiliations.value.splice(0);
                response.data.forEach(employment => {
                    personAffiliations.value.push({title: returnCurrentLocaleContent(employment.organisationUnitName) as string, value: employment.organisationUnitId as number});
                });

                selectedAffiliations.value.splice(0);
                if(props.basic) {
                    selectLatestAffiliation();
                } else {
                    personAffiliations.value.forEach(affiliation => {
                        presetAffiliations.value.forEach(selectedAffiliationId => {
                            if(affiliation.value === selectedAffiliationId) {
                                selectedAffiliations.value.push(affiliation);
                            }
                        });
                    });

                    if (selectedAffiliations.value.length === 0) {
                        selectLatestAffiliation();
                    }

                    sendContentToParent();
                }
            });
        });

        const selectLatestAffiliation = () => {
            if (selectedPerson.value.value && selectedPerson.value.value > 0) {
                PersonService.getLatestAffiliation(selectedPerson.value.value).then((latestAffiliationResponse) => {
                    if(latestAffiliationResponse.data) {
                        selectedAffiliations.value.push({title: returnCurrentLocaleContent(latestAffiliationResponse.data.organisationUnitName) as string, value: latestAffiliationResponse.data.organisationUnitId as number});
                    }
                });
            }
        };

        const clearInput = () => {
            selectedPerson.value = personPlaceholder;
            descriptionRef.value?.clearInput();
            affiliationStatementRef.value?.clearInput();
            personOtherNames.value.splice(0);
        };

        const selectNewlyAddedPerson = (person: BasicPerson) => {
            const toSelect = {title: `${person.personName.firstname} ${person.personName.otherName} ${person.personName.lastname} | ${person.localBirthDate ? localiseDate(person.localBirthDate) : i18n.t("unknownBirthdateMessage")}`, value: person.id as number};
            persons.value.push(toSelect);
            selectedPerson.value = toSelect;
            personOtherNames.value = [{title: selectedPerson.value.title.split("|")[0], value: -1}];
            selectedOtherName.value = personOtherNames.value[0];
            sendContentToParent();
        };

        const toggleExternalSelection = () => {
            selectExternalAssociate.value = !selectExternalAssociate.value;

            customNameInput.value = selectExternalAssociate.value;
            enterExternalOU.value = selectExternalAssociate.value;
            
            sendContentToParent();
        };

        return {
                firstName, middleName, lastName,
                selectedPerson, customNameInput,
                searchPersons, filterPersons, persons,
                requiredFieldRules, requiredSelectionRules,
                contributionDescription, affiliationStatement,
                sendContentToParent, clearInput, onPersonSelect,
                descriptionRef, affiliationStatementRef, toggleExternalSelection,
                personOtherNames, selectedOtherName, selectExternalAssociate,
                selectNewlyAddedPerson, toMultilingualTextInput,
                languageTags, valueSet, selectedAffiliations, personAffiliations,
                PersonSubmissionForm, enterExternalOU
            };
    }
});
</script>

<style scoped>

.custom-label {
    margin-top: 10px;
}

</style>
