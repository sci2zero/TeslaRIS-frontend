<template>
    <v-row>
        <v-col :cols="calculateAutocompleteWidth()">
            <v-autocomplete
                v-model="selectedOrganisationUnit"
                :label="(multiple ? $t('ouListLabel') : $t('organisationUnitLabel')) + (required ? '*' : '')"
                :items="organisationUnits"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :multiple="multiple"
                return-object
                @update:search="searchOUs($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col v-if="!disableSubmission && userRole === 'ADMIN'" cols="1" class="modal-spacer-top">
            <organisation-unit-submission-modal @create="selectNewlyAddedOU"></organisation-unit-submission-modal>
        </v-col>
        <v-col v-if="allowManualClearing && hasSelection" cols="1">
            <v-btn icon @click="clearInput">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, watch, type PropType } from 'vue';
import { ref, onMounted } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
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
        multiple: {
            type: Boolean,
            default: false,
        },
        modelValue: {
            type: [Object, Array] as PropType<
                { title: string; value: number } | { title: string; value: number }[] | undefined
            >,
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
        const { requiredSelectionRules } = useValidationUtils();
        
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const searchPlaceholder = props.multiple ? [] : { title: '', value: -1 };
        
        const selectedOrganisationUnit = ref(
            props.multiple ? (props.modelValue as any[] || []) : (props.modelValue || searchPlaceholder)
        );

        const userRole = computed(() => UserService.provideUserRole());
        
        const hasSelection = computed(() =>
            props.multiple ? (selectedOrganisationUnit.value as any[]).length > 0 : (selectedOrganisationUnit.value as { title: '', value: -1 }).value !== -1
        );

        onMounted(() => {
            if (props.modelValue) {
                selectedOrganisationUnit.value = props.modelValue;
            }
            sendContentToParent();
        });

        watch(() => props.modelValue, () => {
            if (props.modelValue) {
                selectedOrganisationUnit.value = props.modelValue;
            }
        });

        const searchOUs = lodash.debounce((input: string) => {
            if (input.length >= 3) {
                let params = "";
                input.split(" ").forEach(token => {
                    params += `tokens=${token}&`;
                });
                params += "page=0&size=5";
                OrganisationUnitService.searchOUs(params).then((response) => {
                    organisationUnits.value = response.data.content.map((organisationUnit: OrganisationUnitIndex) => ({
                        title: i18n.locale.value === "sr" ? organisationUnit.nameSr : organisationUnit.nameOther,
                        value: organisationUnit.databaseId,
                    }));
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedOrganisationUnit.value);
        };

        const clearInput = () => {
            selectedOrganisationUnit.value = searchPlaceholder;
            sendContentToParent();
        };

        const calculateAutocompleteWidth = () => {
            let numberOfColumns = props.allowManualClearing && hasSelection.value ? 10 : 11;
            if (userRole.value !== "ADMIN") {
                numberOfColumns += 1;
            }
            return numberOfColumns;
        };

        const selectNewlyAddedOU = (organisationUnit: OrganisationUnitResponse) => {
            let title = organisationUnit.name.find(multilingualContent => multilingualContent.languageTag === i18n.locale.value.toUpperCase())?.content;
            if (!title && organisationUnit.name.length > 0) {
                title = organisationUnit.name[0].content;
            }
            const toSelect = { title: `${title} | ${organisationUnit.nameAbbreviation}`, value: organisationUnit.id };
            organisationUnits.value.push(toSelect);
            
            if (props.multiple) {
                (selectedOrganisationUnit.value as any[]).push(toSelect);
            } else {
                selectedOrganisationUnit.value = toSelect;
            }
            sendContentToParent();
        };

        return {
            organisationUnits, selectedOrganisationUnit, searchOUs,
            requiredSelectionRules, calculateAutocompleteWidth,
            sendContentToParent, clearInput, userRole,
            selectNewlyAddedOU, hasSelection
        };
    }
});
</script>