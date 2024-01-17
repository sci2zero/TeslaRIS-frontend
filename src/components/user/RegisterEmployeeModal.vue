<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" dark v-bind="scope.props" style="margin-bottom: 20px;"
                    v-on="scope.isActive">
                    {{ $t("addInstitutionEditorLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addInstitutionEditorLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="name"
                                        :label="$t('firstNameLabel')"
                                        :rules="requiredFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="surname"
                                        :label="$t('surnameLabel')"
                                        :rules="requiredFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="email"
                                        :label="$t('emailLabel')"
                                        :rules="emailFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-select
                                        v-model="selectedLanguage"
                                        :label="$t('preferredLanguageLabel')"
                                        :items="languages"
                                    ></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete
                                        v-model="selectedOrganisationUnit"
                                        :label="$t('organisationUnitLabel')"
                                        :items="organisationUnits"
                                        :custom-filter="filterOUs"
                                        :auto-select-first="true"
                                        :rules="requiredSelectionRules"
                                        @update:search="searchOUs($event)"
                                        :no-data-text="$t('noDataMessage')"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="note"
                                        :label="$t('noteLabel')"
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="registerEmployee()">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import LanguageService from "@/services/LanguageService";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import AuthenticationService from "@/services/AuthenticationService";
import { onMounted } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageResponse } from "@/models/Common";
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import type { EmployeeRegistrationRequest } from "@/models/AuthenticationModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

export default defineComponent({
    name: "RegisterEmployeeModal",
    emits: ["success", "failure"],
    setup(_, {emit}) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const name = ref("")
        const surname = ref("")
        const email = ref("")
        const note = ref("")
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number } | number>({title: "SR", value: -1});
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number } | number>(ouPlaceholder);

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const emailFormatMessage = computed(() => i18n.t("emailFormatError"));

        const emailFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return emailFormatMessage.value;
                return true;
            }
        ];

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || value as number == -1 || (value as { title: string, value: number }).value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

        const searchOUs = (input: string) => {
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
        }

        const filterOUs = (): boolean => {
            return true;
        }

        const registerEmployee = () => {
            const newEmployee: EmployeeRegistrationRequest = {
                name: name.value,
                surname: surname.value,
                email: email.value,
                note: note.value,
                preferredLanguageId: selectedLanguage.value as number,
                organisationUnitId: selectedOrganisationUnit.value as number
            }
            AuthenticationService.registerEmployee(newEmployee).then(() => {
                emit("success");
                name.value = "";
                surname.value = "";
                email.value = "";
                note.value = "";
                selectedOrganisationUnit.value = ouPlaceholder;
                dialog.value = false;
            }).catch((error: AxiosError<any, any>) => {
                emit("failure", error.response?.data.message)
            })
        };

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = language.id;
                    }
                })
            })
        });

        return {dialog, 
                name, 
                surname, 
                organisationUnits, 
                selectedOrganisationUnit, 
                email, note,
                languages, selectedLanguage, 
                searchOUs, filterOUs, 
                registerEmployee, 
                emailFieldRules, requiredFieldRules, requiredSelectionRules,
                isFormValid};
    }
});
</script>
