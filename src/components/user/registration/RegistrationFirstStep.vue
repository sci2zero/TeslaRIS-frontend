<template>
    <div>
        <div>
            <v-text-field
                v-model="firstName"
                label="Ime"
                :rules="firstNameRules"
                @input="updatedFirstName"
            ></v-text-field>
            <v-text-field
                v-model="lastName"
                label="Prezime"
                :rules="lastNameRules"
                @input="updatedLastName"
            ></v-text-field>
        </div>


        <template v-if="isEmptyData">
            <h2>Unesite vaše ime</h2>
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
                    class="mx-auto"
                    title="Nijedan od ponuđenih"
                    :subtitle="newFirstNameTitle"
                    link
                    @click="registrationNextStep"
                ></v-card>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, ref } from "vue";
import lodash from "lodash";
import PersonService from "@/services/PersonService";
import { useRouter } from "vue-router";
import { useRegisterStore } from '@/stores/registerStore';
import { watch } from "vue";


export default defineComponent({
    name: "RegistrationFirstStep",
    emits: ["registration-next-step", "field-update"],
    setup(_, { emit }) {
        const i18n = useI18n();
        const router = useRouter();
        const firstName = ref("")
        const lastName = ref("")

        const registerStore = useRegisterStore();
        const suggestions = ref<typeof PersonService[]>([]);

        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const firstNameRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];
        const lastNameRules = firstNameRules
        
        const isEmptyData = computed(() => firstName.value == "" && lastName.value == "");
        const newFirstNameTitle = computed(() => i18n.t("createNewAccount") + " " + firstName.value + " " + lastName.value);

        // METHODS 

        const updatedFirstName = () => {
            updatedData();
        }

        const updatedLastName = () => {
            updatedData();
        }

        watch([firstName, lastName], () => {
            emit("field-update", firstName.value, lastName.value)
        });

        const updatedData = () => {
            const token: string = firstName.value + " " + lastName.value;
            searchResearchers(token)
        }

        const searchResearchers = lodash.debounce((input: string) => {
                const token = input
                const params = `tokens=${token}&page=0&size=7`
                PersonService.searchResearchers(params).then((response) => {
                    suggestions.value = response.data.content;
                })
        }, 300);

        const registrationNextStep = () => {
            emit("registration-next-step", {firstName: firstName.value, lastName: lastName.value});
            registerStore.clearRegisterPersonData();
        }

        const personClick = (person : any) => {
            PersonService.getPersonWithUser(person.databaseId).then(response => {
                if (response.data.user) {
                    const email = response.data.user.email;
                    router.push({name:"login", path:'/login/', query: { "email": email }})
                } else {
                    registerStore.setRegisterPersonData(response.data)
                    emit("registration-next-step", {});
                }
            }).catch(() => {
                
            })
            
        }
        

        return {firstNameRules, lastNameRules, firstName, lastName,
            updatedFirstName, updatedLastName, suggestions, isEmptyData,
            newFirstNameTitle, registrationNextStep, personClick}
    }
})
</script>

<style>

</style>