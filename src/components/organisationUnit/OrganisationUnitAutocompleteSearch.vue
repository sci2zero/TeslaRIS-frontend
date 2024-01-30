<template>
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
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitIndex } from '@/models/OrganisationUnitModel';


export default defineComponent({
    name: "OrganisationUnitAutocompleteSearch",
    props: {
        required: {
            type: Boolean,
            default: false
        }
    },
    emits: ["setInput"],
    setup(_, {emit}) {
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);

        onMounted(() => {
            sendContentToParent();
        });

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || (value as { title: string, value: number }).value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

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
            emit("setInput", selectedOrganisationUnit.value);
        };

        const clearInput = () => {
            selectedOrganisationUnit.value = ouPlaceholder;
            sendContentToParent();
        };

        return {
            organisationUnits, selectedOrganisationUnit, searchOUs,
            requiredSelectionRules,
            sendContentToParent, clearInput
        };
    }
});
</script>
