<template>
    <div class="contribution-segments">
        <section class="editor-section">
            <h3 class="editor-section-title">
                {{ $t("personLabel") }}
            </h3>
            <v-row v-if="allowExternalAssociate">
                <v-col cols="12" class="pb-1">
                    <v-radio-group
                        v-model="associateSource"
                        inline
                        hide-details
                        density="compact"
                        color="primary"
                        class="mode-radio-group"
                        :disabled="lockSearchField"
                    >
                        <v-radio
                            :label="$t('selectAssociateFromSystemLabel')"
                            value="internal"
                            color="primary"
                        />
                        <v-radio
                            :label="$t('addExternalAssociateLabel')"
                            value="external"
                            color="primary"
                        />
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row v-if="!selectExternalAssociate">
                <v-col :cols="canUserAddPersons ? 11 : 12">
                    <ui-input
                        v-model="selectedPerson"
                        control="autocomplete"
                        :label="allowExternalAssociate ? $t('searchInSystemLabel') : ($t('personLabel') + (required ? '*' : ''))"
                        :items="persons"
                        :custom-filter="filterPersons"
                        :rules="required ? requiredSelectionRules : []"
                        :no-data-text="$t('noDataMessage')"
                        return-object
                        :readonly="lockSearchField"
                        @update:search="searchPersons($event)"
                        @update:model-value="onPersonSelect($event)"
                        @blur="onAutocompleteBlur"
                    >
                        <template #item="{ item, props }">
                            <v-list-item
                                v-bind="{ ...props, title: undefined }">
                                <person-publications-tooltip
                                    :person-id="item.raw.value"
                                    :show="showLatestPublications">
                                    {{ item.raw.title }}
                                </person-publications-tooltip>
                            </v-list-item>
                        </template>
                    </ui-input>
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
            <v-row v-if="personOtherNames.length > 0 || selectExternalAssociate">
                <v-col v-if="!selectExternalAssociate" cols="12" class="pb-1">
                    <div class="name-source">
                        <span class="mode-switch-label">{{ $t("personOtherNamesLabel") }}</span>
                        <v-btn-toggle
                            v-model="nameSource"
                            mandatory
                            divided
                            density="compact"
                            variant="outlined"
                            color="primary"
                            class="name-source-toggle"
                        >
                            <v-btn value="list" size="small">
                                {{ $t("selectFromListLabel") }}
                            </v-btn>
                            <v-btn value="custom" size="small">
                                {{ $t("addCustomLabel") }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                </v-col>
                <v-col v-if="!customNameInput && !selectExternalAssociate" cols="12">
                    <ui-input
                        v-model="selectedOtherName"
                        control="select"
                        :items="personOtherNames"
                        :auto-select-first="true"
                        :no-data-text="$t('noDataMessage')"
                        :aria-label="$t('personOtherNamesLabel')"
                        return-object
                        @update:model-value="sendContentToParent"
                    />
                </v-col>
                <template v-if="customNameInput || selectExternalAssociate">
                    <v-col cols="12" sm="4">
                        <ui-input
                            v-model="firstName"
                            :label="$t('firstNameLabel') + '*'"
                            :placeholder="$t('firstNameLabel')"
                            :rules="requiredFieldRules"
                            append-inner-icon="mdi-swap-horizontal"
                            @click:append-inner="[firstName, lastName] = [lastName, firstName]; sendContentToParent();"
                            @update:model-value="onNamePartUpdate('firstName', $event)"
                        />
                    </v-col>
                    <v-col cols="12" sm="4">
                        <ui-input
                            v-model="middleName"
                            :label="$t('middleNameLabel')"
                            :placeholder="$t('middleNameLabel')"
                            @update:model-value="onNamePartUpdate('middleName', $event)"
                        />
                    </v-col>
                    <v-col cols="12" sm="4">
                        <ui-input
                            v-model="lastName"
                            :label="$t('surnameLabel') + '*'"
                            :placeholder="$t('surnameLabel')"
                            :rules="requiredFieldRules"
                            @update:model-value="onNamePartUpdate('lastName', $event)"
                        />
                    </v-col>
                </template>
            </v-row>
            <v-row v-if="!basic">
                <v-col>
                    <date-picker
                        v-model="dateFrom"
                        :label="$t('fromLabel')"
                        color="primary"
                    />
                </v-col>
                <v-col>
                    <date-picker
                        v-model="dateTo"
                        :label="$t('toLabel')"
                        color="primary"
                    />
                </v-col>
            </v-row>
        </section>

        <section v-if="showAffiliationSection" class="editor-section">
            <h3 class="editor-section-title">
                {{ $t("personAffiliationsLabel") }}
            </h3>
            <v-row>
                <v-col cols="12" class="pb-1">
                    <v-radio-group
                        v-model="affiliationSource"
                        inline
                        hide-details
                        density="compact"
                        color="primary"
                        class="mode-radio-group"
                    >
                        <v-radio
                            :label="$t('searchInSystemLabel')"
                            value="list"
                            color="primary"
                        />
                        <v-radio
                            :label="$t('addCustomLabel')"
                            value="external"
                            color="primary"
                        />
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row v-show="!enterExternalOU">
                <v-col v-if="usePersonAffiliationList" cols="12">
                    <ui-input
                        v-model="selectedAffiliations"
                        control="select"
                        :items="personAffiliations"
                        :no-data-text="$t('noAffiliationsMessage')"
                        :aria-label="$t('personAffiliationsLabel')"
                        return-object
                        multiple
                        @update:model-value="sendContentToParent"
                    />
                </v-col>
                <v-col v-else cols="12">
                    <organisation-unit-autocomplete-search
                        v-model="selectedAffiliations"
                        multiple
                        disable-submission
                        @update:model-value="sendContentToParent"
                    />
                </v-col>
            </v-row>
            <v-row v-show="enterExternalOU">
                <v-col>
                    <multilingual-text-input
                        ref="affiliationStatementRef"
                        v-model="affiliationStatement"
                        :label="$t('affiliationStatementLabel')"
                        :initial-value="toMultilingualTextInput(presetContributionValue.affiliationStatement, languageTags)"
                        @update:model-value="sendContentToParent" />
                </v-col>
            </v-row>
            <v-row v-show="enterExternalOU && (affiliationStatement && (affiliationStatement.length === 0 || affiliationStatement[0].text === ''))">
                <v-chip
                    v-for="(suggestion, index) in externalInstitutionSuggestions" :key="index" class="ml-2" outlined
                    @click="affiliationStatementRef?.setNewInputValue(toMultilingualTextInput(suggestion, languageTags))">
                    {{ returnCurrentLocaleContent(suggestion) }}
                </v-chip>
            </v-row>
        </section>

        <section v-if="!basic" class="editor-section">
            <h3 class="editor-section-title">
                {{ $t("researchAreasLabel") }}
            </h3>
            <research-areas-selection
                ref="researchAreasSelectionRef"
                :research-areas-hierarchy="presetResearchAreas"
                submit-on-click
                @update="saveResearchAreas"
            />
        </section>
        <!-- <v-row>
            <v-col>
                <multilingual-text-input
                    v-if="!basic" ref="descriptionRef" v-model="contributionDescription" :label="$t('abstractLabel')"
                    :initial-value="toMultilingualTextInput(presetContributionValue.description, languageTags)"
                    is-area
                    @update:model-value="sendContentToParent"></multilingual-text-input>
            </v-col>
        </v-row> -->
    </div>
</template>

<script lang="ts">
import { computed, nextTick, ref } from "vue";
import { defineComponent } from "vue";
import PersonService from "@/services/PersonService";
import { PersonNameType, type BasicPerson, type PersonIndex } from "@/models/PersonModel";
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
import { foldSerbianText, removeTrailingPipeRegex } from "@/utils/StringUtil";
import GenericCrudModal from "./GenericCrudModal.vue";
import PersonSubmissionForm from "../person/PersonSubmissionForm.vue";
import { useUserRole } from "@/composables/useUserRole";
import UserService from "@/services/UserService";
import { useRoute } from "vue-router";
import { type PersonUserResponse } from "@/models/PersonUserModel";
import { type AxiosResponse } from "axios";
import PersonPublicationsTooltip from "../person/PersonPublicationsTooltip.vue";
import { type ResearchArea } from "@/models/OrganisationUnitModel.js";
import ResearchAreasSelection from "./ResearchAreasSelection.vue";
import DatePicker from "./DatePicker.vue";
import UiInput from "@/components/ui/input/Input.vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";


export default defineComponent({
    name: "PersonContributionBase",
    components: { MultilingualTextInput, GenericCrudModal, PersonPublicationsTooltip, ResearchAreasSelection, DatePicker, UiInput, OrganisationUnitAutocompleteSearch },
    props: {
        basic: {
            type: Boolean,
            default: false
        },
        presetContributionValue: {
            type: Object as PropType<{personId: number, description: MultilingualContent[], affiliationStatement: MultilingualContent[], selectedOtherName: string[], institutionIds: number[], researchAreas: ResearchArea[], dateFrom: string, dateTo: string}>,
            default: () => ({
                personId: -1,
                description: [],
                affiliationStatement: [],
                selectedOtherName: [],
                researchAreas: [],
                dateFrom: "",
                dateTo: ""
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
        showLatestPublications: {
            type: Boolean,
            default: true
        },
        suggestionDisplayCheck: {
            type: Function as PropType<((personId: number) => boolean)>,
            default: () => { return true; }
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const { canUserAddPersons, isResearcher, isAdmin, isInstitutionalEditor } = useUserRole();

        const commonSurnameSuffixes = import.meta.env.VITE_COMMON_SURNAME_SUFFIXES || "";

        const contributionDescription = ref([]);
        const affiliationStatement = ref<any>([]);

        const enterExternalOU = ref(false);

        const customNameInput = ref(false);
        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");
        const dateFrom = ref("");
        const dateTo = ref("");

        const presetResearchAreas = ref<ResearchArea[]>([]);
        const researchAreaIds = ref<number[]>([]);

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

        const valueSet = ref(!props.isUpdate);

        const selectExternalAssociate = ref(false);
        const lastSearchInput = ref("");
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
                    searchingName.value = true;
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
                            otherName: "",
                            personNameType: PersonNameType.DISPLAY_NAME
                        };
                    }
                    
                    persons.value = listOfPersons;
                });
            }
        }, 300);

        const filterPersons = (): boolean => {
            return true;
        };

        const searchingName = ref(false);

        const namePart = (value: unknown): string =>
            typeof value === "string" ? value : "";

        const composeName = (...parts: unknown[]): string =>
            parts
                .map((part) => namePart(part).trim())
                .filter((part) => part && part.toLowerCase() !== "null")
                .join(" ");

        const onNamePartUpdate = (field: "firstName" | "middleName" | "lastName", value: unknown) => {
            const normalized = namePart(value);
            if (field === "firstName") {
                firstName.value = normalized;
            } else if (field === "middleName") {
                middleName.value = normalized;
            } else {
                lastName.value = normalized;
            }
            sendContentToParent();
        };

        watch(() => props.presetContributionValue, () => {
            if(props.presetContributionValue && !valueSet.value) {
                valueSet.value = true;

                presetResearchAreas.value = props.presetContributionValue?.researchAreas as ResearchArea[];
                researchAreaIds.value = props.presetContributionValue?.researchAreas?.map(researchArea => researchArea.id) as number[];
                dateFrom.value = props.presetContributionValue.dateFrom;
                dateTo.value = props.presetContributionValue.dateTo;

                if (props.presetContributionValue.affiliationStatement?.length > 0) {
                    enterExternalOU.value = true;
                } else {
                    enterExternalOU.value = false;
                }

                const otherNameParts = Array.isArray(props.presetContributionValue.selectedOtherName)
                    ? props.presetContributionValue.selectedOtherName
                    : [];
                const selectedPersonName = composeName(
                    otherNameParts[0],
                    otherNameParts[1],
                    otherNameParts[2]
                );
                presetAffiliations.value = props.presetContributionValue.institutionIds;

                firstName.value = namePart(otherNameParts[0]);
                middleName.value = namePart(otherNameParts[1]).toLowerCase() === "null" ? "" : namePart(otherNameParts[1]);
                lastName.value = namePart(otherNameParts[2]);

                if(props.presetContributionValue.personId && !isNaN(props.presetContributionValue.personId) && props.presetContributionValue.personId > 0) {
                    PersonService.readPerson(props.presetContributionValue.personId).then((personResponse) => {
                        personPrimaryName.value = personResponse.data.personName;
                        
                        selectedPerson.value = {title: `${constructDisplayName(personResponse.data.personName)}`, value: personResponse.data.id as number};

                        personOtherNames.value = [{title: selectedPerson.value.title, value: personResponse.data.personName}];
                        personResponse.data.personOtherNames.forEach((otherName) => {
                            if (otherName.dateFrom) {
                                personOtherNames.value.push(
                                    {
                                        title: `${constructDisplayName(otherName)} | ${otherName.dateFrom} - ${otherName.dateTo ? otherName.dateTo : "*"}`, 
                                        value: otherName as PersonName
                                    }
                                );
                            } else {
                                personOtherNames.value.push(
                                    {
                                        title: `${constructDisplayName(otherName)}`,
                                        value: otherName as PersonName
                                    }
                                );
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
                } else if (!props.presetContributionValue.personId) {
                    // A missing id means a non-managed contributor. The -1 placeholder only means
                    // "nothing picked yet", so it must neither flip the row into external mode nor
                    // reach readPerson(-1).
                    customNameInput.value = true;
                    selectExternalAssociate.value = true;
                }
            }
        }, { deep: true, immediate: true });

        watch(customNameInput, () => {
            if (customNameInput.value && personPrimaryName.value) {
                firstName.value = firstName.value ? firstName.value : personPrimaryName.value.firstname;
                lastName.value = lastName.value ? lastName.value : personPrimaryName.value.lastname;

                const isCustomName =
                    firstName.value !== personPrimaryName.value.firstname || lastName.value !== personPrimaryName.value.lastname;

                if (personPrimaryName.value.otherName && !isCustomName && searchingName.value) {
                    middleName.value = middleName.value ? middleName.value : personPrimaryName.value.otherName;
                    searchingName.value = false;
                }
            }
        });

        const onPersonSelect = (selection: {title: string, value: number}) => {
            if (!selection) {
                return;
            }

            if (selection.value === 0 || isNaN(selection.value)) {
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
                    personOtherNames.value.push(
                        {
                            title: `${constructDisplayName(otherName)}` + (otherName.dateFrom ? ` | ${otherName.dateFrom} - ${otherName.dateTo ? otherName.dateTo : "*"}` : ""),
                            value: otherName as PersonName
                        }
                    )
                });

                sendContentToParent();
            });
        };

        const constructDisplayName = (name: PersonName): string => {
            const first = namePart(name.firstname);
            const last = namePart(name.lastname);
            const other = namePart(name.otherName).trim();

            if (other) {
                return composeName(first, `(${other})`, last);
            }

            return composeName(first, last);
        };

        const constructExternalCollaboratorFromInput = (selectionTitle: string) => {
            if (!selectionTitle) {
                return;
            }

            const extracted = extractTextInParentheses(selectionTitle)?.trim();

            if (!extracted) {
                return;
            }

            const nameTokens = extracted
                .split(/\s+/)
                .filter(Boolean);

            if (nameTokens.length === 0) {
                return;
            }

            const surnameSuffixes = commonSurnameSuffixes
                .split(",")
                .map((s: string) => s.trim().toLowerCase());

            let surnameIndex = -1;

            for (let i = 0; i < nameTokens.length; i++) {
                const token = nameTokens[i].toLowerCase();

                if (
                    surnameSuffixes.some((suffix: string) =>
                        foldSerbianText(token).endsWith(suffix)
                    )
                ) {
                    surnameIndex = i;
                    break;
                }
            }

            // Fallback: assume last token is surname
            if (surnameIndex === -1) {
                surnameIndex = nameTokens.length - 1;
            }

            lastName.value = toTitleCase(nameTokens[surnameIndex]);

            const firstNameTokens = nameTokens.filter(
                (_, index) => index !== surnameIndex
            );

            firstName.value = toTitleCase(firstNameTokens.join(" "));
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

        const toTitleCase = (str: string) => {
            return str
                .toLowerCase()
                .replace(/(^|\P{L})(\p{L})/gu, (_, boundary, char) =>
                    boundary + char.toUpperCase()
                );
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
                otherName = [namePart(firstName.value), namePart(middleName.value), namePart(lastName.value), null, null]
            }

            const unmangedAffiliations = enterExternalOU.value;
            
            const returnObject = {
                personId: selectExternalAssociate.value ? -1 : selectedPerson.value.value,
                description: contributionDescription.value,
                affiliationStatement: unmangedAffiliations ? affiliationStatement.value : [],
                selectedOtherName: otherName,
                institutionIds: unmangedAffiliations ? [] : selectedAffiliations.value.map(affiliation => affiliation.value),
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                researchAreasId: researchAreaIds.value
            };
            
            emit("setInput", returnObject);
        };

        watch([
                contributionDescription, affiliationStatement,
                dateFrom, dateTo
            ], 
            () => sendContentToParent()
        );

        watch(selectedPerson, () => {
            if (!selectedPerson.value || selectedPerson.value.value <= 0) {
                return;
            }

            if (props.presetContributionValue?.personId !== selectedPerson.value.value) {
                affiliationStatement.value = [];
                affiliationStatementRef.value?.clearInput();
            }

            enterExternalOU.value = false;

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

                if ((affiliationStatement.value?.length || 0) > 0) {
                    enterExternalOU.value = true;
                } else {
                    enterExternalOU.value = false;
                }
            });
        });

        const selectLatestAffiliation = () => {
            if (selectedPerson.value.value && selectedPerson.value.value > 0 && !props.isUpdate) {
                PersonService.getLatestAffiliation(selectedPerson.value.value).then((latestAffiliationResponse) => {
                    if(latestAffiliationResponse.data) {
                        selectedAffiliations.value.push(
                            {
                                title: returnCurrentLocaleContent(latestAffiliationResponse.data.organisationUnitName) as string, 
                                value: latestAffiliationResponse.data.organisationUnitId as number
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
            const toSelect = {
                title: `${person.personName.firstname} ${person.personName.otherName} ${person.personName.lastname} | ${person.localBirthDate ? localiseDate(person.localBirthDate) : i18n.t("unknownBirthdateMessage")}`, 
                value: person.id as number
            };
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

        const setExternalSelection = (isExternal: boolean) => {
            if (selectExternalAssociate.value === isExternal) {
                return;
            }

            selectExternalAssociate.value = isExternal;
            customNameInput.value = isExternal;

            if (isExternal) {
                if (!namePart(firstName.value) && !namePart(lastName.value)) {
                    constructExternalCollaboratorFromInput(lastSearchInput.value);
                }
            } else if (!(selectedPerson.value?.value > 0)) {
                let searchInput = namePart(lastSearchInput.value).trim();
                if (searchInput.startsWith("(") && searchInput.endsWith(")")) {
                    searchInput = searchInput.slice(1, -1).trim();
                }
                if (!searchInput) {
                    searchInput = composeName(lastName.value, firstName.value);
                }

                selectedPerson.value = searchInput
                    ? { title: searchInput, value: -1 }
                    : { ...personPlaceholder };
                persons.value = [];
            }

            sendContentToParent();
        };

        const associateSource = computed({
            get: (): "internal" | "external" =>
                selectExternalAssociate.value ? "external" : "internal",
            set: (value: "internal" | "external") => {
                if (value !== "internal" && value !== "external") {
                    return;
                }
                setExternalSelection(value === "external");
            }
        });

        const showAffiliationSection = computed(() =>
            !props.basic ||
            personOtherNames.value.length > 0 ||
            selectExternalAssociate.value
        );

        const usePersonAffiliationList = computed(() =>
            !selectExternalAssociate.value && personAffiliations.value.length > 0
        );

        const affiliationSource = computed({
            get: (): "list" | "external" =>
                enterExternalOU.value ? "external" : "list",
            set: (value: "list" | "external") => {
                enterExternalOU.value = value === "external";
            }
        });

        const nameSource = computed({
            get: (): "list" | "custom" =>
                customNameInput.value ? "custom" : "list",
            set: (value: "list" | "custom") => {
                customNameInput.value = value === "custom";
                nextTick(() => sendContentToParent());
            }
        });

        const switchToExternalAuthor = () => {
            if (selectedPerson.value && selectedPerson.value.value <= 0) {
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
                        otherName: "",
                        personNameType: PersonNameType.DISPLAY_NAME
                    };
                }
            }, 0);
        };

        const setContributor = (contributor: Record<string, number>) => {
            selectedPerson.value = {title: `${contributor.a}`, value: contributor.b}
            onPersonSelect(selectedPerson.value);
        };

        const externalInstitutionSuggestions = ref<MultilingualContent[][]>([]);
        watch(enterExternalOU, (newValue, oldvalue) => {
            if(
                oldvalue === false && newValue === true &&
                affiliationStatement.value.length === 0
            ) {
                externalInstitutionSuggestions.value.splice(0);
                InvolvementService.getExternalInstitutionSuggestions(
                    selectedPerson.value.value
                ).then(response => {
                    externalInstitutionSuggestions.value = response.data;
                });
            }

            sendContentToParent();
        });

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
            sendContentToParent();
        };

        return {
            firstName, middleName, lastName, selectedPerson, customNameInput,
            searchPersons, filterPersons, persons, requiredFieldRules,
            requiredSelectionRules, contributionDescription, affiliationStatement,
            sendContentToParent, clearInput, onPersonSelect, displayTopCollaboratorPicks,
            descriptionRef, affiliationStatementRef, associateSource, affiliationSource, nameSource,
            showAffiliationSection, usePersonAffiliationList, personOtherNames, selectedOtherName, selectExternalAssociate,
            selectNewlyAddedPerson, toMultilingualTextInput, topContributors,
            languageTags, valueSet, selectedAffiliations, personAffiliations,
            PersonSubmissionForm, enterExternalOU, canUserAddPersons,
            constructExternalCollaboratorFromInput, onAutocompleteBlur, onNamePartUpdate,
            presetPersonNameForCreation, setContributor, selectExistingSelectedPerson,
            externalInstitutionSuggestions, returnCurrentLocaleContent,
            dateFrom, dateTo, presetResearchAreas, saveResearchAreas
        };
    }
});
</script>

<style scoped>
.contribution-segments {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.editor-section {
    padding: 12px 14px 8px;
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.03);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.editor-section-title {
    margin: 0 0 10px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.55);
}

.mode-radio-group {
    margin: 0;
}

.mode-radio-group :deep(.v-selection-control-group) {
    flex-wrap: wrap;
    column-gap: 4px;
}

.mode-radio-group :deep(.v-selection-control) {
    min-height: 32px;
}

.mode-radio-group :deep(.v-label) {
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 1;
}

.mode-switch-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.2;
    color: #64748b;
    padding-left: 0.15rem;
}

.name-source {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.name-source-toggle {
    flex: 0 0 auto;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #fff;
}

.name-source-toggle :deep(.v-btn) {
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.8rem;
    font-weight: 500;
    min-width: 0;
    height: 32px;
}
</style>
