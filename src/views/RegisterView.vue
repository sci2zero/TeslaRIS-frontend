<template>
    <v-container ma-0 pa-0 fill-height>
        <div id="registerStepper">
            <h2 class="register-title">
                {{ $t("registerLabel") }}
            </h2>

            <v-stepper
                v-model="stepperValue" :items="['Step 1', 'Step 2']"
                :next-text="$t('nextLabel')"
                :prev-text="$t('previousLabel')">
                <template #[`item.1`]>
                    <div class="reg-step">
                        <registration-first-step @registration-next-step="nextStep" @field-update="checkForNextStep"></registration-first-step>
                    </div>
                </template>

                <template #[`item.2`]>
                    <div class="reg-step">
                        <registration-second-step :firstname="userDetails.firstName" :lastname="userDetails.lastName"></registration-second-step>
                    </div>
                </template>

                <template #actions>
                    <div class="d-flex flex-row justify-between">
                        <v-btn :disabled="stepperValue === 1" @click="previousStep">
                            {{ $t('previousLabel') }}
                        </v-btn>
                        <v-btn :disabled="stepperValue === 2 || !canAdvance" @click="nextStep">
                            {{ $t('nextLabel') }}
                        </v-btn>
                    </div>
                </template>
            </v-stepper>
        </div>
    </v-container>
</template>

<script lang="ts">
import RegistrationFirstStep from '@/components/user/registration/RegistrationFirstStep.vue';
import RegistrationSecondStep from '@/components/user/registration/RegistrationSecondStep.vue';

import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "RegisterView",
    components: { RegistrationFirstStep, RegistrationSecondStep },

    setup() {
        const stepperValue = ref(1);
        const canAdvance = ref(false);

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("registerLabel");
        });

        const userDetails = ref({
            firstName: "",
            lastName: ""
        });

        const nextStep = (data: {firstName: string, lastName: string}) => {
            if (data.firstName) userDetails.value.firstName = data.firstName
            if (data.lastName) userDetails.value.lastName = data.lastName
            stepperValue.value = 2;
        };

        const previousStep = () => {
            stepperValue.value -= 1;
        };

        const checkForNextStep = (firstname: string, lastname: string) => {
            if(firstname !== "" && lastname !== "") {
                canAdvance.value = true;
                userDetails.value.firstName = firstname;
                userDetails.value.lastName = lastname;
            } else {
                canAdvance.value = false;
            }
        };

        return {stepperValue, nextStep,
            userDetails, previousStep,
            checkForNextStep, canAdvance}
    }
});
</script>

<style scoped>
    .reg-step {
        margin: 0 auto;
        max-width: 450px;
    }

    .register-title {
        margin-top: 1em;
        font-size: 1.6em;
        color: #444444;
    }

    
</style>

<style>
    #registerStepper .v-stepper-header {
        display: none;
    }
</style>