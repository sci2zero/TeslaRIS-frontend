<template>
    <v-col>
        <v-text-field
            ref="passwordRef"
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="rules"
            :type="showPassword ? 'text' : 'password'"
            :label="label"
            class="mb-6"
            @input="$emit('passwordChange', password)"
            @click:append="showPassword = !showPassword;"
        ></v-text-field>
        <v-progress-linear
            :color="score().color"
            :model-value="score().value"
            :bg-opacity="0.1"
            class="progress"
        ></v-progress-linear>
    </v-col>
    <v-col v-if="repeatPassword" class="bg-blue-grey-lighten-5">
        <v-text-field
            v-model="repeatNewPassword"
            :label="$t('repeatNewPasswordLabel')"
            :rules="repeatPasswordRules"
            :type="showPassword ? 'text' : 'password'"
        ></v-text-field>
    </v-col>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/lib/components/index.mjs';
import zxcvbn from 'zxcvbn';


export default defineComponent({
    name: "PasswordInputWithMeter",
    props: {
        label: {
            type: String,
            required: true
        },
        repeatPassword: {
            type: Boolean,
            default: false
        }
    },
    emits: ["passwordChange"],
    setup(props) {
        const showPassword = ref(false);
        const password = ref("");
        const repeatNewPassword = ref("");

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const shortPasswordMessage = computed(() => i18n.t("shortPasswordMessage"));
        const invalidPasswordFormatMessage = computed(() => i18n.t("invalidPasswordFormatMessage"));

        const passwordRef = ref<typeof VTextField>();

        onMounted(() => {
            if (props.repeatPassword) {
                rules.value.push((value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    if (password.value !== repeatNewPassword.value) return passwordsDontMatchMessage.value;

                    return true;
                });
            }
        });

        const rules = ref([
            (value: string) => !!value || requiredFieldMessage.value,
            (value: string) => value.length >= 8 || shortPasswordMessage.value,
            (value: string) => (/[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value)) || invalidPasswordFormatMessage.value
        ]);

        const passwordsDontMatchMessage = computed(() => i18n.t("passwordsDontMatchMessage"));
        const repeatPasswordRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                if (password.value !== repeatNewPassword.value) return passwordsDontMatchMessage.value;

                if (passwordRef.value) {
                    passwordRef.value.validate()
                }

                return true;
            }
        ];

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

        return {
            score, password, 
            showPassword, rules,
            repeatNewPassword,
            repeatPasswordRules,
            passwordRef
        };
    }
});
</script>

<style scoped>
    
    .progress {
        margin-top: -15px;
    }

</style>
