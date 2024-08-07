<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-for="(relation, index) in data" :key="relation.id">
            <v-col cols="3">
                <v-select
                    v-model="relation.relationType"
                    :items="relationTypes"
                    :label="$t('relationTypeLabel')"
                    return-object>
                </v-select>
            </v-col>
            <v-col cols="7">
                <organisation-unit-autocomplete-search :ref="(el) => (autocompleteSearchRef[index] = el)" v-model:model-value="relation.targetOrganisationUnit" required></organisation-unit-autocomplete-search>
            </v-col>
            <v-col cols="2">
                <v-btn v-if="relation.id || index > 0" icon @click="removeRelation(index, relation.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn v-if="index === data.length - 1" icon @click="addRelation">
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
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { OrganisationUnitsRelationType, type OrganisationUnitRelationRequest, type OrganisationUnitRelationResponse, type OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/organisationUnitRelationType';
import OrganisationUnitAutocompleteSearch from '../OrganisationUnitAutocompleteSearch.vue';

export default defineComponent({
    name: "OrganisationUnitRelationUpdateForm",
    components: { OrganisationUnitAutocompleteSearch },
    props: {
        sourceOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
            required: true
        },
        relations: {
            type: Object as PropType<OrganisationUnitRelationResponse[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const autocompleteSearchRef = ref<any>([]);
        const data = ref<any[]>([{relationType: {title: getTitleFromValueAutoLocale(OrganisationUnitsRelationType.BELONGS_TO), value: OrganisationUnitsRelationType.BELONGS_TO}, targetOrganisationUnit: {title: "", value: -1}}]);

        const languageList = ref<LanguageTagResponse[]>([]);
        const toDelete = ref<number[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });

            if(props.relations && props.relations.length > 0) {
                data.value = [];
                props.relations?.forEach(relation => {
                    data.value.push({
                        id: relation.id,
                        relationType: {title: getTitleFromValueAutoLocale(relation.relationType), value: relation.relationType},
                        dateFrom: "",
                        dateTo: "",
                        targetOrganisationUnit: {title: returnCurrentLocaleContent(relation.targetOrganisationUnitName), value: relation.targetOrganisationUnitId}
                    });
                });
            }
        });

        const { requiredFieldRules } = useValidationUtils();

        const updateOURelations = () => {
            const updatedOURelations: OrganisationUnitRelationRequest[] = [];
            data.value.forEach(relation => {
                updatedOURelations.push({
                    id: relation.id,
                    relationType: relation.relationType.value,
                    dateFrom: "",
                    dateTo: "",
                    sourceAffiliationStatement: [],
                    targetAffiliationStatement: [],
                    sourceOrganisationUnitId: props.sourceOU?.id as number,
                    targetOrganisationUnitId: relation.targetOrganisationUnit.value
                });
            });

            emit("update", updatedOURelations, toDelete.value);
        };

        const relationTypes = getTypesForGivenLocale();

        const addRelation = () => {
            data.value.push({relationType: {title: getTitleFromValueAutoLocale(OrganisationUnitsRelationType.BELONGS_TO), value: OrganisationUnitsRelationType.BELONGS_TO}, targetOrganisationUnit: {title: "", value: -1}});
        };

        const removeRelation = (index: number, relationId: number) => {
            data.value.splice(index, 1);
            if (relationId) {
                toDelete.value.push(relationId);
            }
            if(data.value.length === 0) {
                emit("update", [], toDelete.value);
            }
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
