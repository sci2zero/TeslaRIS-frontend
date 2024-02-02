<template>
    <v-row>
        <v-col cols="12">
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
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
    </v-row>
    <multilingual-text-input ref="descriptionRef" v-model="contributionDescription" :label="$t('descriptionLabel')" is-area></multilingual-text-input>
    <multilingual-text-input ref="affiliationStatementRef" v-model="affiliationStatement" :label="$t('affiliationStatementLabel')"></multilingual-text-input>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import PersonService from "@/services/PersonService";
import type { PersonIndex } from "@/models/PersonModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import MultilingualTextInput from "./MultilingualTextInput.vue";
import lodash from "lodash";
import { watch } from "vue";

export default defineComponent({
    name: "PersonContributionBase",
    components: {MultilingualTextInput},
    emits: ["setInput"],
    setup(_, {emit}) {
        const contributionDescription = ref([]);
        const affiliationStatement = ref([]);

        const descriptionRef = ref<typeof MultilingualTextInput>();
        const affiliationStatementRef = ref<typeof MultilingualTextInput>();

        const persons = ref<{ title: string, value: number }[]>([]);
        const personPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(personPlaceholder);

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const requiredSelectionRules = [
            (value: { title: string, value: number }) => {
                if (!value || value.value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

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
                            listOfPersons.push({title: `${person.name} | ${person.birthdate} | ${person.employmentsSr}`, value: person.databaseId});
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

        const sendContentToParent = () => {
            const returnObject = {
                personId: selectedPerson.value.value,
                description: contributionDescription.value,
                affiliationStatement: affiliationStatement.value
            };
            emit("setInput", returnObject);
        };

        watch(contributionDescription, () => sendContentToParent());
        watch(affiliationStatement, () => sendContentToParent());

        const clearInput = () => {
            selectedPerson.value = personPlaceholder;
            descriptionRef.value?.clearInput();
            affiliationStatementRef.value?.clearInput();
        };

        return {persons, 
                selectedPerson,
                searchPersons, filterPersons,
                requiredFieldRules, requiredSelectionRules,
                contributionDescription, affiliationStatement,
                sendContentToParent, clearInput,
                descriptionRef, affiliationStatementRef};
    }
});
</script>
