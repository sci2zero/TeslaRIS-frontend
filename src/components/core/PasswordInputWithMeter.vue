<template>
    <v-text-field
        v-model="password"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :rules="[rules.required, rules.min, rules.strength]"
        validate-on-blur
        :type="showPassword ? 'text' : 'password'"
        :label="label"
        class="mb-6"
        @input="$emit('passwordChange', password)"
        @click:append="showPassword = !showPassword; $emit('showRepeatedPassword');"
    ></v-text-field>
    <v-progress-linear
        :color="score().color"
        :model-value="score().value"
        :bg-opacity="0.1"
        class="progress"
    ></v-progress-linear>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import zxcvbn from 'zxcvbn';


export default defineComponent({
    name: "PasswordInputWithMeter",
    props: {
        label: {
            type: String,
            required: true
        },},
    emits: ["passwordChange", "showRepeatedPassword"],
    setup() {
        const showPassword = ref(false);
        const password = ref("");

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const shortPasswordMessage = computed(() => i18n.t("shortPasswordMessage"));
        const invalidPasswordFormatMessage = computed(() => i18n.t("invalidPasswordFormatMessage"));

        const rules = ref({
            required: (value: string) => !!value || requiredFieldMessage.value,
            min: (value: string) => value.length >= 8 || shortPasswordMessage.value,
            strength: (value: string) => (/[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value)) || invalidPasswordFormatMessage.value
        });

        const score = () => {
            const result = zxcvbn(password.value);
            
            switch (result.score) {
                case 4:
                return {
                    color: "light-blue",
                    value: 100
                };
                case 3:
                return {
                    color: "light-green",
                    value: 75
                };
                case 2:
                return {
                    color: "yellow",
                    value: 50
                };
                case 1:
                return {
                    color: "orange",
                    value: 25
                };
                default:
                return {
                    color: "red",
                    value: 0
                };
            }
        }

        return {score, password, showPassword, rules};
    }
});
</script>

<style scoped>
    
    .progress {
        margin-top: -15px;
    }

</style>
