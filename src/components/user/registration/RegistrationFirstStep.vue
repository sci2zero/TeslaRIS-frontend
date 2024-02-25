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
                    title="Nijedan od ponnuđenih"
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
import type { PersonIndex } from "@/models/PersonModel";
import UserService from "@/services/UserService";
import { useRouter } from "vue-router";
import { useRegisterStore } from '@/stores/registerStore';


export default defineComponent({
    name: "RegistrationFirstStep",
    emits: ["registration-next-step"],

    setup(props,{emit}) {
        const i18n = useI18n();
        const router = useRouter();
        const firstName = ref("")
        const lastName = ref("")

        const registerStore = useRegisterStore();
        const suggestions = ref<PersonService[]>([]);

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

        const updatedData = () => {
            const token: string = firstName.value + " " + lastName.value;
            console.log(token)
            searchResearchers(token)
        }

        const searchResearchers = lodash.debounce((input: string) => {
                const token = input
                const params = `tokens=${token}&page=0&size=7`
                PersonService.searchResearchers(params).then((response) => {
                    console.log(response);
                    suggestions.value = response.data.content;
                    // const listOfOUs: { title: string, value: number }[] = [];
                    // response.data.content.forEach((organisationUnit: OrganisationUnitIndex) => {
                    //     if (i18n.locale.value === "sr") {
                    //         listOfOUs.push({title: organisationUnit.nameSr, value: organisationUnit.databaseId});
                    //     } else {
                    //         listOfOUs.push({title: organisationUnit.nameOther, value: organisationUnit.databaseId});
                    //     }
                    // })
                    // organisationUnits.value = listOfOUs;
                // });
                })
        }, 300);

        const registrationNextStep = () => {
            emit("registration-next-step", {firstName: firstName.value, lastName: lastName.value});
            registerStore.clearRegisterPersonData();
        }

        const personClick = (person : any) => {
            console.log(person);

            PersonService.getPersonWithUser(person.databaseId).then(response => {
                console.log(response);
                if (response.data.user) {
                    const email = response.data.user.email;
                    router.push({name:"login", path:'/login/', query: { "email": email }})
                } else {
                    registerStore.setRegisterPersonData(response.data)
                    emit("registration-next-step", {});
                }
            }).catch(exception => {
                console.log(exception)
            })
            
        }
        

        return {firstNameRules, lastNameRules, firstName, lastName, updatedFirstName, updatedLastName, suggestions, isEmptyData, newFirstNameTitle, registrationNextStep, personClick}
    }
})
</script>

<style>

</style>