<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-for="(relation, index) in data" :key="relation.id">
            <v-col cols="7">
                <organisation-unit-autocomplete-search :ref="(el) => (autocompleteSearchRef[index] = el)" v-model:model-value="relation.targetOrganisationUnit" required></organisation-unit-autocomplete-search>
            </v-col>
            <v-col cols="3">
                <v-select
                    v-model="relation.relationType"
                    :items="relationTypes"
                    :label="$t('relationTypeLabel')"
                    return-object>
                </v-select>
            </v-col>
            <v-col cols="2">
                <v-btn v-if="index > 0" icon @click="removeRelation(index)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon @click="addRelation">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import { OrganisationUnitsRelationType, type OrganisationUnitRelationRequest, type OrganisationUnitRelationResponse } from '@/models/OrganisationUnitModel';
import { getTypesForGivenLocale } from '@/i18n/organisationUnitRelationType';
import OrganisationUnitAutocompleteSearch from '../OrganisationUnitAutocompleteSearch.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "OrganisationUnitRelationUpdateForm",
    components: { OrganisationUnitAutocompleteSearch },
    props: {
        relations: {
            type: Object as PropType<OrganisationUnitRelationResponse[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const i18n = useI18n();

        const autocompleteSearchRef = ref<any>([]);
        const data = ref<any[]>([{relationType: OrganisationUnitsRelationType.BELONGS_TO, targetOrganisationUnit: {title: "", value: -1}}]);

        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });

            props.relations?.forEach(relation => {
                data.value.push({
                    relationType: relation.relationType,
                    dateFrom: "",
                    dateTo: "",
                    targetOrganisationUnit: {title: returnCurrentLocaleContent(relation.targetOrganisationUnitName), value: relation.targetOrganisationUnitId}
                });
            });
        });

        const { requiredFieldRules } = useValidationUtils();

        const updateOURelations = () => {
            const updatedOURelations: OrganisationUnitRelationRequest[] = [];
            data.value.forEach(relation => {
                updatedOURelations.push({
                    relationType: relation.relationType,
                    dateFrom: "",
                    dateTo: "",
                    sourceAffiliationStatement: [],
                    targetAffiliationStatement: [],
                    sourceOrganisationUnitId: 0,
                    targetOrganisationUnitId: relation.targetOrganisationUnit.value.value
                });
            });

            emit("update", updatedOURelations);
        };

        const relationTypes = getTypesForGivenLocale(i18n.locale.value);

        const addRelation = () => {
            data.value.push({value: ""});
        };

        const removeRelation = (index: number) => {
            data.value.splice(index, 1);
        };

        return {
            isFormValid,
            requiredFieldRules, data,
            toMultilingualTextInput, languageList,
            addRelation, removeRelation, relationTypes,
            updateOURelations, autocompleteSearchRef
        };
    }
});
</script>
