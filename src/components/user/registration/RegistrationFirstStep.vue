<template>
    <div>
        <ui-input
            v-model="firstName"
            :label="$t('firstNameLabel')"
            :placeholder="$t('firstNameLabel')"
            :rules="requiredFieldRules"
            class="register-field"
            @update:model-value="updatedFirstName"
        />
        <ui-input
            v-model="lastName"
            :label="$t('surnameLabel')"
            :placeholder="$t('surnameLabel')"
            :rules="requiredFieldRules"
            class="register-field"
            @update:model-value="updatedLastName"
        />

        <div v-if="!isEmptyData" class="researcher-picker">
            <v-progress-linear
                v-if="searching && suggestions.length === 0"
                indeterminate
                color="#3b6fe0"
                class="search-progress"
            />

            <p v-if="suggestions.length" class="picker-label">
                {{ $t("selectResearcherLabel") }}
            </p>

            <div v-if="suggestions.length" class="researcher-list">
                <button
                    v-for="personSuggestion in suggestions"
                    :key="personSuggestion.id"
                    type="button"
                    class="researcher-option"
                    @click="personClick(personSuggestion)">
                    <v-icon icon="mdi-account-outline" class="researcher-icon" />
                    <span class="researcher-copy">
                        <span class="researcher-name">{{ personSuggestion.name }}</span>
                        <span v-if="employmentLabel(personSuggestion)" class="researcher-meta">
                            {{ employmentLabel(personSuggestion) }}
                        </span>
                    </span>
                </button>
            </div>

            <p v-if="showNoMatchNote" class="no-match-note">
                {{ $t("noMatchingResearchersMessage") }}
                <template v-if="!newResearcherCreationAllowed">
                    {{ $t("noResearcherSelectionMessage") }}
                </template>
            </p>

            <button
                v-if="newResearcherCreationAllowed"
                type="button"
                class="researcher-option researcher-option-create"
                @click="registrationNextStep">
                <v-icon icon="mdi-account-plus-outline" class="researcher-icon" />
                <span class="researcher-copy">
                    <span class="researcher-name">
                        {{ suggestions.length ? $t("noneOfTheOfferedLabel") : newFirstNameTitle }}
                    </span>
                    <span v-if="suggestions.length" class="researcher-meta">
                        {{ newFirstNameTitle }}
                    </span>
                </span>
            </button>
        </div>

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
import Toast from "@/components/core/Toast.vue";
import UiInput from "@/components/ui/input/Input.vue";


export default defineComponent({
    name: "RegistrationFirstStep",
    components: { Toast, UiInput },
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
        const searching = ref(false);
        const searchCompleted = ref(false);
        let requestSerial = 0;

        const { requiredFieldRules } = useValidationUtils();
        
        const isEmptyData = computed(() => firstName.value == "" && lastName.value == "");
        const newFirstNameTitle = computed(() => i18n.t("createNewAccount") + " " + firstName.value + " " + lastName.value);
        const showNoMatchNote = computed(() =>
            searchCompleted.value &&
            !searching.value &&
            suggestions.value.length === 0 &&
            !isEmptyData.value
        );

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
            const token = `${firstName.value} ${lastName.value}`.trim();
            if (token.length < 2) {
                searchResearchers.cancel();
                requestSerial += 1;
                suggestions.value = [];
                searching.value = false;
                searchCompleted.value = false;
                return;
            }

            searching.value = true;
            searchResearchers(token);
        };

        const searchResearchers = lodash.debounce((input: string) => {
            const tokens = input.trim().split(" ").filter(token => token !== "");

            let searchTokens = "";
            tokens.forEach(token => {
                searchTokens += `tokens=${token}&`;
            });

            const params = `${searchTokens}page=0&size=7`;
            const requestId = ++requestSerial;
            PersonService.searchResearchers(params, false, null).then((response) => {
                if (requestId !== requestSerial) {
                    return;
                }

                suggestions.value = response.data.content;
                searching.value = false;
                searchCompleted.value = true;
            }).catch(() => {
                if (requestId !== requestSerial) {
                    return;
                }

                suggestions.value = [];
                searching.value = false;
                searchCompleted.value = true;
            });
        }, 300);

        const employmentLabel = (person: PersonIndex) => {
            const value = i18n.locale.value.startsWith("sr") ? person.employmentsSr : person.employmentsOther;
            return (value || "").replace(/\s*\|\s*/g, " · ").replace(/(?:\s*·\s*)+$/g, "").trim();
        };

        const registrationNextStep = () => {
            emit("registration-next-step", {firstName: firstName.value, lastName: lastName.value});
            registerStore.clearRegisterPersonData();
        };

        const personClick = (person: PersonIndex) => {
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
            snackbar, searching, showNoMatchNote, employmentLabel
        }
    }
})
</script>

<style scoped>
    .register-field {
        margin-bottom: 1rem;
    }

    .researcher-picker {
        margin-top: 0.5rem;
    }

    .search-progress {
        margin-bottom: 0.75rem;
    }

    .picker-label {
        margin: 0.25rem 0 0.65rem;
        font-size: 0.8125rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #8a94ad;
    }

    .researcher-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .researcher-option {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.8rem 0.9rem;
        text-align: left;
        background: #f7f9fd;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 0.75rem;
        cursor: pointer;
        transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .researcher-list .researcher-option {
        margin-top: 0;
    }

    .researcher-option:hover,
    .researcher-option:focus-visible {
        background: #f3f7ff;
        border-color: #3b6fe0;
        outline: none;
    }

    .researcher-option-create {
        background: #ffffff;
        border-style: dashed;
    }

    .researcher-icon {
        margin-top: 0.1rem;
        color: #3b6fe0;
    }

    .researcher-copy {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
    }

    .researcher-name {
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1.4;
        color: #1f2d52;
    }

    .researcher-meta {
        font-size: 0.8125rem;
        line-height: 1.4;
        color: #7b859c;
    }

    .no-match-note {
        margin: 0.75rem 0 0;
        padding: 0.85rem 1rem;
        border-radius: 0.75rem;
        background: #f4f7fc;
        font-size: 0.9375rem;
        line-height: 1.5;
        color: #556080;
    }
</style>
