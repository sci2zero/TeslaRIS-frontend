<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-list-item dark v-bind="scope.props" class="inline-action w-80" v-on="scope.isActive">
                    <v-list-item-title>
                        {{ $t("addResearcherLabel") }}
                    </v-list-item-title>
                </v-list-item>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addResearcherLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <person-autocomplete-search
                            v-model="selectedPerson"
                            required
                            :disable-submission="!newResearcherCreationAllowed">
                        </person-autocomplete-search>
                        <registration-second-step
                            v-if="proceedToSecondStep"
                            ref="formRef"
                            :firstname="firstName"
                            :lastname="lastName"
                            in-modal
                        />
                        <p
                            v-else-if="message"
                            class="ml-1 text-red">
                            {{ message }}
                        </p>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="registerResearcher(false)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="registerResearcher(true)">
                        {{ $t("saveAndAddAnotherLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { defineComponent } from "vue";
import RegistrationSecondStep from "./registration/RegistrationSecondStep.vue";
import PersonAutocompleteSearch from "../person/PersonAutocompleteSearch.vue";
import UserService from "@/services/UserService";
import { useRegisterStore } from "@/stores/registerStore";
import PersonService from "@/services/PersonService";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "RegisterResearcherModal",
    components: { RegistrationSecondStep, PersonAutocompleteSearch },
    emits: ["success", "failure"],
    setup() {
        const dialog = ref(false);
        const isFormValid = computed(() => !!formRef.value?.isFormValid)

        const searchPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);
        
        const formRef = ref<typeof RegistrationSecondStep>();
        const newResearcherCreationAllowed = ref(false);

        const registerStore = useRegisterStore();
        const firstName = ref("");
        const lastName = ref("");
        const proceedToSecondStep = ref(false);

        const i18n = useI18n();
        const message = ref("");

        onMounted(() => {
            UserService.isRegisterResearcherCreationAllowed().then(response => {
                newResearcherCreationAllowed.value = response.data;
            });
        });

        const registerResearcher = async (persistForm: boolean) => {
            if (!formRef.value) {
                return;
            }

            const success = await formRef.value.register();

            if (!success) {
                return;
            }

            if (persistForm) {
                formRef.value.clearForm();
                selectedPerson.value = searchPlaceholder;
            } else {
                setTimeout(() => dialog.value = false, 5000);
            }
        };

        watch(selectedPerson, () => {
            message.value = "";
            if (selectedPerson.value.value > 0) {
                registerStore.clearRegisterPersonData();
                PersonService.getPersonWithUser(selectedPerson.value.value).then(response => {
                    if (response.data.user) {
                        message.value = i18n.t("researcherBoundMessage", [response.data.user.email]);
                    } else {
                        registerStore.setRegisterPersonData(response.data);
                        firstName.value = response.data.personName.firstname;
                        lastName.value = response.data.personName.lastname;
                        proceedToSecondStep.value = true;
                    }
                });
            }
        });

        return {
            dialog, formRef, isFormValid,
            registerResearcher, selectedPerson,
            newResearcherCreationAllowed,
            firstName, lastName, message,
            proceedToSecondStep
        };
    }
});
</script>
