<template>
    <v-row>
        <v-col :cols="calculateAutocompleteWidth()">
            <v-autocomplete
                v-model="selectedOrganisationUnit"
                :label="$t('organisationUnitLabel') + (required ? '*' : '')"
                :items="organisationUnits"
                :custom-filter="((): boolean => true)"
                :auto-select-first="true"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchOUs($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col v-if="userRole === 'ADMIN'" cols="1" style="margin-top: 20px;">
            <organisation-unit-submission-modal @create="selectNewlyAddedOU"></organisation-unit-submission-modal>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedOrganisationUnit.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitIndex, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitSubmissionModal from './OrganisationUnitSubmissionModal.vue';
import UserService from '@/services/UserService';
import { useValidationUtils } from '@/utils/ValidationUtils';


export default defineComponent({
    name: "OrganisationUnitAutocompleteSearch",
    components: { OrganisationUnitSubmissionModal },
    props: {
        required: {
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
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);

        const userRole = computed(() => UserService.provideUserRole());

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedOrganisationUnit.value = props.modelValue;
            }
            sendContentToParent();
        });

        const i18n = useI18n();
        const { requiredSelectionRules } = useValidationUtils();

        const searchOUs = lodash.debounce((input: string) => {
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                OrganisationUnitService.searchOUs(params).then((response) => {
                    const listOfOUs: { title: string, value: number }[] = [];
                    response.data.content.forEach((organisationUnit: OrganisationUnitIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfOUs.push({title: organisationUnit.nameSr, value: organisationUnit.databaseId});
                        } else {
                            listOfOUs.push({title: organisationUnit.nameOther, value: organisationUnit.databaseId});
                        }
                    })
                    organisationUnits.value = listOfOUs;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedOrganisationUnit.value);
        };

        const clearInput = () => {
            selectedOrganisationUnit.value = ouPlaceholder;
            sendContentToParent();
        };

        const calculateAutocompleteWidth = () => {
            let numberOfColumns = props.allowManualClearing && selectedOrganisationUnit.value.value !== -1 ? 10 : 11;
            if (userRole.value !== "ADMIN") {
                numberOfColumns += 1;
            }
            return numberOfColumns;
        };

        const selectNewlyAddedOU = (organisationUnit: OrganisationUnitResponse) => {
            let title: string | undefined;
            organisationUnit.name.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            
            if (!title && organisationUnit.name.length > 0) {
                title = organisationUnit.name[0].content;
            }

            const toSelect = {title: `${title} | ${organisationUnit.nameAbbreviation}`, value: organisationUnit.id as number};
            organisationUnits.value.push(toSelect);
            selectedOrganisationUnit.value = toSelect;
            sendContentToParent();
        };

        return {
            organisationUnits, selectedOrganisationUnit, searchOUs,
            requiredSelectionRules, calculateAutocompleteWidth,
            sendContentToParent, clearInput, userRole,
            selectNewlyAddedOU
        };
    }
});
</script>
