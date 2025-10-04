<template>
    <div>
        <div>
            <v-text-field
                v-model="firstName"
                :label="$t('firstNameLabel')"
                :rules="requiredFieldRules"
                @input="updatedFirstName"
            ></v-text-field>
            <v-text-field
                v-model="lastName"
                :label="$t('surnameLabel')"
                :rules="requiredFieldRules"
                @input="updatedLastName"
            ></v-text-field>
        </div>


        <template v-if="isEmptyData">
            <h2>{{ $t("enterYourNameLabel") }}</h2>
        </template>
        <template v-else>
            <div class="select-user my-2">
                <h3>Izaberi istraživača</h3>
                <div class="my-1">
                    <v-card
                        v-for="personSuggestion in suggestions" :key="personSuggestion.id"
                        class="mx-auto"
                        :title="personSuggestion.name"
                        :subtitle="personSuggestion.employmentsSr"
                        link
                        @click="personClick(personSuggestion)"
                    ></v-card>
                </div>

                <v-card
                    v-if="newResearcherCreationAllowed"
                    class="mx-auto"
                    :title="$t('noneOfTheOfferedLabel')"
                    :subtitle="newFirstNameTitle"
                    link
                    @click="registrationNextStep"
                ></v-card>
            </div>
        </template>

        <toast v-model="snackbar" :message="message" />
    </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, onMounted, ref } from "vue";
import lodash from "lodash";
import PersonService from "@/services/PersonService";
import { useRouter } from "vue-router";
import { useRegisterStore } from '@/stores/registerStore';
import { watch } from "vue";
import { type PersonIndex } from "@/models/PersonModel";
import { useValidationUtils } from "@/utils/ValidationUtils";
import UserService from "@/services/UserService";


export default defineComponent({
    name: "RegistrationFirstStep",
    emits: ["registration-next-step", "field-update"],
    setup(_, { emit }) {
        const message = ref("");
        const snackbar = ref(false);
        
        const i18n = useI18n();
        const router = useRouter();
        
        const firstName = ref("");
        const lastName = ref("");

        const newResearcherCreationAllowed = ref(false);

        const registerStore = useRegisterStore();
        const suggestions = ref<PersonIndex[]>([]);

        const { requiredFieldRules } = useValidationUtils();
        
        const isEmptyData = computed(() => firstName.value == "" && lastName.value == "");
        const newFirstNameTitle = computed(() => i18n.t("createNewAccount") + " " + firstName.value + " " + lastName.value);

        onMounted(() => {
            UserService.isRegisterResearcherCreationAllowed().then(response => {
                newResearcherCreationAllowed.value = response.data;
            });
        });

        const updatedFirstName = () => {
            updatedData();
        };

        const updatedLastName = () => {
            updatedData();
        };

        watch([firstName, lastName], () => {
            emit("field-update", firstName.value, lastName.value)
        });

        const updatedData = () => {
            const token: string = firstName.value + " " + lastName.value;
            searchResearchers(token);
        };

        const searchResearchers = lodash.debounce((input: string) => {
            const tokens = input.split(" ").filter(t => t !== " " && t !== "");
            let searchTokens = "";
            tokens.forEach(token => {
                searchTokens += `tokens=${token}&`;
            });

            const params = `${searchTokens}page=0&size=7`;
            PersonService.searchResearchers(params, false, null).then((response) => {
                suggestions.value = response.data.content;
            });
        }, 300);

        const registrationNextStep = () => {
            emit("registration-next-step", {firstName: firstName.value, lastName: lastName.value});
            registerStore.clearRegisterPersonData();
        };

        const personClick = (person : any) => {
            PersonService.getPersonWithUser(person.databaseId).then(response => {
                if (response.data.user) {
                    const email = response.data.user.email;
                    router.push({name:"login", path:'/login/', query: { "email": email }})
                } else {
                    registerStore.setRegisterPersonData(response.data);
                    emit("registration-next-step", 
                        {
                            firstName: response.data.personName.firstname,
                            lastName: response.data.personName.lastname
                        }
                    );
                }
            }).catch(() => {
                message.value = i18n.t("genericErrorMessage");
                snackbar.value = true;  
            });
        };

        return {
            requiredFieldRules, firstName, lastName,
            updatedFirstName, updatedLastName,
            suggestions, isEmptyData, message,
            newFirstNameTitle, registrationNextStep,
            personClick, newResearcherCreationAllowed,
            snackbar
        }
    }
})
</script>

<style>

</style>