<template>
    <v-row v-if="!selectExternalAssociate">
        <v-col :cols="canUserAddPersons ? 11 : 12">
            <v-autocomplete
                v-model="selectedPerson"
                :label="$t('personLabel') + (required ? '*' : '')"
                :items="persons"
                :custom-filter="filterPersons"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                return-object
                :readonly="lockSearchField"
                @update:search="searchPersons($event)"
                @update:model-value="onPersonSelect($event)"
                @blur="onAutocompleteBlur"
            />
        </v-col>
        <v-col v-if="canUserAddPersons" cols="1">
            <generic-crud-modal
                :form-component="PersonSubmissionForm"
                :form-props="{ inModal: true, presetPersonName: presetPersonNameForCreation }"
                entity-name="Person"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedPerson"
                @selected="selectExistingSelectedPerson"
            />
        </v-col>
    </v-row>
    <v-row v-if="showTopSuggestions && !selectExternalAssociate && (!selectedPerson || selectedPerson.value <= 0)">
        <v-chip
            v-for="contributor in topContributors" :key="contributor.b" class="ml-2" outlined
            @click="setContributor(contributor)">
            {{ contributor.a }}
        </v-chip>
    </v-row>
    <!-- <v-btn
        v-if="allowExternalAssociate && !selectExternalAssociate"
        color="primary"
        class="text-body-2 mb-2"
        @click="toggleExternalSelection">
        {{ $t("addExternalAssociateLabel") }}
    </v-btn> -->
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
        v-if="selectExternalAssociate"
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
            <v-btn color="primary" class="text-body-2 mb-2" @click="enterExternalOU = !enterExternalOU; sendContentToParent();">
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
import { localiseDate } from "@/utils/DateUtil";
import { removeTrailingPipeRegex } from "@/utils/StringUtil";
import GenericCrudModal from "./GenericCrudModal.vue";
import PersonSubmissionForm from "../person/PersonSubmissionForm.vue";
import { useUserRole } from "@/composables/useUserRole";
import UserService from "@/services/UserService";
import { useRoute } from "vue-router";
import { type PersonUserResponse } from "@/models/PersonUserModel";
import { type AxiosResponse } from "axios";


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
        },
        required: {
            type: Boolean,
            default: true
        },
        isUpdate: {
            type: Boolean,
            default: false
        },
        lockSearchField: {
            type: Boolean,
            default: false
        },
        showTopSuggestions: {
            type: Boolean,
            default: false
        },
        suggestionDisplayCheck: {
            type: Function as PropType<((personId: number) => boolean)>,
            default: () => { return true; }
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const { canUserAddPersons, isResearcher, isAdmin, isInstitutionalEditor } = useUserRole();

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

        const personPrimaryName = ref<PersonName>();
        const personOtherNames = ref<{ title: string, value: PersonName | number }[]>([]);
        const selectedOtherName = ref<{ title: string, value: PersonName | number }>(personOtherNamePlaceholder.value);

        const languageTags = ref<LanguageTagResponse[]>([]);

        const valueSet = ref(false);

        const selectExternalAssociate = ref(false);
        const lastSearchInput = ref();
        const presetPersonNameForCreation = ref<PersonName>();

        const topContributors = ref<Record<string, number>[]>([]);

        onMounted(async () => {
            if (!props.isUpdate) {
                valueSet.value = true;
            }

            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });


            displayTopCollaboratorPicks();
        });

        const route = useRoute();

        const displayTopCollaboratorPicks = async () => {
            const researcherId = route.query.researcherId;
            if ((isResearcher.value || researcherId) && props.showTopSuggestions) {
                topContributors.value.splice(0);

                const loggedInUser = await UserService.getLoggedInUser();
                if (props.suggestionDisplayCheck(loggedInUser?.data.personId as number)) {
                    topContributors.value.push(
                        {
                            a: `${loggedInUser?.data.firstname as string} ${loggedInUser?.data.lastName as string} (${i18n.t('meLabel')})`,
                            b: loggedInUser?.data.personId as number
                        }
                    );

                    PersonService.getTopCollaborators().then(response => {
                        response.data.forEach(collaborator => {
                            if (props.suggestionDisplayCheck(collaborator.b)) {
                                topContributors.value.push(collaborator);
                            }
                        });
                    });
                } else if ((isAdmin.value || isInstitutionalEditor.value) && researcherId) {
                    const personId = parseInt(researcherId as string);
                    PersonService.getPersonWithUser(personId).then((response: AxiosResponse<PersonUserResponse>) => {
                        topContributors.value.push(
                            {
                                a: `${response.data.personName.firstname as string} ${response.data.personName.lastname as string}`,
                                b: personId
                            }
                        );

                        PersonService.getTopCollaborators(personId).then(response => {
                            response.data.forEach(collaborator => {
                                topContributors.value.push(collaborator);
                            });
                        });
                    });
                }
            }
        };

        const searchPersons = lodash.debounce((input: string) => {
            if (props.lockSearchField || !input || input.includes("|") || (selectedPerson.value && selectedPerson.value.value === 0)) {
                return;
            }

            if (input.length >= 3) {
                lastSearchInput.value = `(${input.replaceAll('(', '').replaceAll(')', '')})`;
                
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                PersonService.searchResearchers(
                    params, false, null
                ).then((response) => {
                    const listOfPersons: { title: string, value: number }[] = [];
                    response.data.content.forEach((person: PersonIndex) => {
                        if (i18n.locale.value.startsWith("sr")) {
                            listOfPersons.push(
                                {title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsSr}`), value: person.databaseId}
                            );
                        } else {
                            listOfPersons.push(
                                {title: removeTrailingPipeRegex(`${person.name} | ${person.birthdate ? localiseDate(person.birthdate) : i18n.t("unknownBirthdateMessage")} | ${person.employmentsOther}`), value: person.databaseId}
                            );
                        }
                    });

                    if (props.allowExternalAssociate) {
                        let personName = input;
                        if (personName.startsWith("(") && personName.endsWith(")")) {
                            personName = personName.substring(1, -1);
                        }

                        listOfPersons.push({
                            title: i18n.t("notInListLabel", [personName]),
                            value: 0
                        });
                    } else {
                        presetPersonNameForCreation.value = {
                            firstname: tokens[0],
                            lastname: tokens.length > 1 ? tokens[tokens.length - 1] : "",
                            otherName: ""
                        };
                    }
                    
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
                        personPrimaryName.value = personResponse.data.personName;
                        
                        selectedPerson.value = {title: `${constructDisplayName(personResponse.data.personName)}`, value: personResponse.data.id as number};

                        personOtherNames.value = [{title: selectedPerson.value.title, value: personResponse.data.personName}];
                        personResponse.data.personOtherNames.forEach((otherName) => {
                            if (otherName.dateFrom) {
                                personOtherNames.value.push({title: `${constructDisplayName(otherName)} | ${otherName.dateFrom} - ${otherName.dateTo ? otherName.dateTo : "*"}`, value: otherName as PersonName});
                            } else {
                                personOtherNames.value.push({title: `${constructDisplayName(otherName)}`, value: otherName as PersonName});
                            }
                        });

                        const foundName = personOtherNames.value.find(otherName => {
                            return otherName.title.replaceAll("(", "").replaceAll(")", "") === selectedPersonName;
                        });

                        if(foundName) {
                            selectedOtherName.value = foundName;
                            clearCustomNameValues();
                        } else if(selectedPersonName.trim() === "") {
                            customNameInput.value = false;
                            selectedOtherName.value = personOtherNames.value[0];
                            clearCustomNameValues();
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

        watch(customNameInput, () => {
            if (customNameInput.value && personPrimaryName.value) {
                firstName.value = firstName.value ? firstName.value : personPrimaryName.value.firstname;
                lastName.value = lastName.value ? lastName.value : personPrimaryName.value.lastname;

                const isCustomName =
                    firstName.value !== personPrimaryName.value.firstname || lastName.value !== personPrimaryName.value.lastname;

                if (personPrimaryName.value.otherName && !isCustomName) {
                    middleName.value = middleName.value ? middleName.value : personPrimaryName.value.otherName;
                }
            }
        });

        const onPersonSelect = (selection: {title: string, value: number}) => {
            if (!selection) {
                return;
            }

            if (selection.value === 0) {
                selectExternalAssociate.value = true;
                customNameInput.value = true;
                constructExternalCollaboratorFromInput(selection.title);
                sendContentToParent();
                return;
            }

            PersonService.readPerson(selection.value).then((response) => {
                personPrimaryName.value = response.data.personName;
                personOtherNames.value = [
                    {title: constructDisplayName(response.data.personName), value: response.data.personName}
                ];

                selectedOtherName.value = personOtherNames.value[0];
                response.data.personOtherNames.forEach((otherName) => {
                    personOtherNames.value.push({title: `${constructDisplayName(otherName)}` + (otherName.dateFrom ? ` | ${otherName.dateFrom} - ${otherName.dateTo ? otherName.dateTo : "*"}` : ""), value: otherName as PersonName})
                });

                sendContentToParent();
            });
        };

        const constructDisplayName = (name: PersonName): string => {
            if (name.otherName && name.otherName.trim() !== "") {
                return `${name.firstname} (${name.otherName}) ${name.lastname}`;
            }

            return `${name.firstname} ${name.lastname}`;
        };

        const constructExternalCollaboratorFromInput = (selectionTitle: string) => {
            if (!selectionTitle) {
                return;
            }

            const nameTokens = extractTextInParentheses(selectionTitle).split(" ");
            if (nameTokens.length > 0) {
                lastName.value = toTitleCase(nameTokens[0]);

                if (nameTokens.length > 1) {
                    firstName.value = toTitleCase(nameTokens[nameTokens.length - 1]);
                }
            }
        };

        const clearCustomNameValues = () => {
            firstName.value = "";
            lastName.value = "";
            middleName.value = "";
        };

        const extractTextInParentheses = (input: string) => {
            const match = input.match(/\(([^)]+)\)/);
            if (match && match[1]) {
                return match[1];
            }

            return "";
        };

        function toTitleCase(str: string) {
            return str.toLowerCase().replace(/\b\w/g, function(char) {
                return char.toUpperCase();
            });
        }

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

            const unmangedAffiliations = (selectExternalAssociate.value || enterExternalOU.value);
            
            const returnObject = {
                personId: selectExternalAssociate.value ? -1 : selectedPerson.value.value,
                description: contributionDescription.value,
                affiliationStatement: unmangedAffiliations ? affiliationStatement.value : [],
                selectedOtherName: otherName,
                institutionIds: unmangedAffiliations ? [] : selectedAffiliations.value.map(affiliation => affiliation.value)
            };
            
            emit("setInput", returnObject);
        };

        watch(contributionDescription, () => sendContentToParent());
        watch(affiliationStatement, () => sendContentToParent());

        watch(selectedPerson, () => {
            if (!selectedPerson.value || selectedPerson.value.value <= 0) {
                return;
            }

            InvolvementService.getPersonEmployments(selectedPerson.value.value).then((response) => {
                personAffiliations.value.splice(0);
                response.data.forEach(employment => {
                    personAffiliations.value.push(
                        {
                            title: returnCurrentLocaleContent(employment.organisationUnitName) as string,
                            value: employment.organisationUnitId as number
                        }
                    );
                });

                if (props.basic) {
                    enterExternalOU.value = false;
                }

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
            if (selectedPerson.value.value && selectedPerson.value.value > 0 && !props.isUpdate) {
                PersonService.getLatestAffiliation(selectedPerson.value.value).then((latestAffiliationResponse) => {
                    if(latestAffiliationResponse.data) {
                        selectedAffiliations.value.push(
                            {
                                title: returnCurrentLocaleContent(latestAffiliationResponse.data.organisationUnitName) as string, value: latestAffiliationResponse.data.organisationUnitId as number
                            }
                        );
                    }
                });
            }
        };

        const clearInput = () => {
            selectedPerson.value = personPlaceholder;
            descriptionRef.value?.clearInput();
            affiliationStatementRef.value?.clearInput();
            personOtherNames.value.splice(0);
            firstName.value = "";
            lastName.value = "";
            middleName.value = "";

            selectExternalAssociate.value = false;
            customNameInput.value = false;
        };

        const selectNewlyAddedPerson = (person: BasicPerson) => {
            const toSelect = {title: `${person.personName.firstname} ${person.personName.otherName} ${person.personName.lastname} | ${person.localBirthDate ? localiseDate(person.localBirthDate) : i18n.t("unknownBirthdateMessage")}`, value: person.id as number};
            persons.value.push(toSelect);
            selectedPerson.value = toSelect;
            personOtherNames.value = [{title: selectedPerson.value.title.split("|")[0], value: -1}];
            selectedOtherName.value = personOtherNames.value[0];
            sendContentToParent();
        };

        const selectExistingSelectedPerson = (person: PersonIndex) => {
            const toSelect = {title: person.name, value: person.databaseId as number};
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

            if (!selectExternalAssociate.value) {
                let searchInput = lastSearchInput.value ? lastSearchInput.value : (lastName.value + " " + firstName.value);
                if (searchInput.startsWith("(") && searchInput.endsWith(")")) {
                    searchInput = searchInput.slice(1, -1);
                }
                
                selectedPerson.value = {
                    title: searchInput, value: -1
                };
            }
            
            sendContentToParent();
        };

        const switchToExternalAuthor = () => {
            if (selectedPerson.value.value <= 0) {
                selectExternalAssociate.value = true;
                customNameInput.value = true;
                constructExternalCollaboratorFromInput(lastSearchInput.value);
            }

            sendContentToParent();
        };

        const onAutocompleteBlur = () => {
            if (!props.allowExternalAssociate) {
                return;
            }

            setTimeout(() => {
                const active = document.activeElement;
                const isInsideCrudModal = active && active.closest('.generic-crud-modal');

                if (!isInsideCrudModal) {
                    switchToExternalAuthor();
                } else {
                    let name = "", surname = "";
                    const nameTokens =
                        extractTextInParentheses(lastSearchInput.value).split(" ");
                        
                        if (nameTokens.length > 0) {
                            surname = toTitleCase(nameTokens[0]);

                            if (nameTokens.length > 1) {
                                name = toTitleCase(nameTokens[nameTokens.length - 1]);
                            }
                        }
                    
                    presetPersonNameForCreation.value = {
                        firstname: name,
                        lastname: surname,
                        otherName: ""
                    };
                }
            }, 0);
        };

        const setContributor = (contributor: Record<string, number>) => {
            selectedPerson.value = {title: `${contributor.a}`, value: contributor.b}
            onPersonSelect(selectedPerson.value);
        };

        return {
                firstName, middleName, lastName, selectedPerson, customNameInput,
                searchPersons, filterPersons, persons, requiredFieldRules,
                requiredSelectionRules, contributionDescription, affiliationStatement,
                sendContentToParent, clearInput, onPersonSelect, displayTopCollaboratorPicks,
                descriptionRef, affiliationStatementRef, toggleExternalSelection,
                personOtherNames, selectedOtherName, selectExternalAssociate,
                selectNewlyAddedPerson, toMultilingualTextInput, topContributors,
                languageTags, valueSet, selectedAffiliations, personAffiliations,
                PersonSubmissionForm, enterExternalOU, canUserAddPersons,
                constructExternalCollaboratorFromInput, onAutocompleteBlur,
                presetPersonNameForCreation, setContributor, selectExistingSelectedPerson
            };
    }
});
</script>

<style scoped>

.custom-label {
    margin-top: 10px;
}

</style>
