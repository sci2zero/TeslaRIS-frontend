<template>
    <v-container ma-0 pa-0 fill-height>
        <div id="registerStepper">
            <h2 class="register-title">
                {{ $t("registerLabel") }}
            </h2>

            <v-stepper
        
                v-model="stepperValue" :items="['Step 1', 'Step 2']">
                <template #item.1>
                    <div class="reg-step">
                        <registration-first-step @registration-next-step="nextStep"></registration-first-step>
                    </div>
                </template>

                <template #item.2>
                    <div class="reg-step">
                        <registration-second-step :first-name="userDetails.firstName" :last-name="userDetails.lastName"></registration-second-step>
                    </div>
                </template>
            </v-stepper>
        </div>
    </v-container>
</template>

<script lang="ts">
import RegistrationFirstStep from '@/components/user/registration/RegistrationFirstStep.vue';
import RegistrationSecondStep from '@/components/user/registration/RegistrationSecondStep.vue';

import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: "RegisterView",
    components: { RegistrationFirstStep, RegistrationSecondStep },

    setup() {
        const stepperValue = ref(1);

        const userDetails = {
            firstName: "",
            lastName: ""
        }

        const nextStep = (data: {firstName: string, lastName: string}) => {
            if (data.firstName) userDetails.firstName = data.firstName
            if (data.lastName) userDetails.lastName = data.lastName
            console.log(data);
            stepperValue.value = 2;
        };


        return {stepperValue, nextStep, userDetails}
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