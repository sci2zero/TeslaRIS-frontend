<template>
    <div class="d-flex flex-row justify-start" style="width: 100%;">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-list-item
                    v-if="!readOnly"
                    v-bind="scope.props" :disabled="readOnly"
                    v-on="scope.isActive">
                    <v-list-item-title>{{ $t("updateEmailLabel") }}</v-list-item-title>
                </v-list-item>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateEmailLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                        v-model="email"
                                        :label="$t('newEmailLabel') + '*'"
                                        :placeholder="$t('newEmailLabel') + '*'"
                                        :rules="emailFieldRules">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-row>
                                <p class="required-fields-message">
                                    {{ $t("requiredFieldsMessage") }}
                                </p>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
                        :disabled="!isFormValid || email === presetEmail"
                        @click="forceEmailChange">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import UserService from "@/services/UserService";
import { useValidationUtils } from "@/utils/ValidationUtils";


export default defineComponent({
    name: "UserEmailChangeModal",
    props: {
        userId: {
            type: Number,
            required: true
        },
        presetEmail: {
            type: String,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const email = ref(props.presetEmail);
        const { emailFieldRules } = useValidationUtils();

        const forceEmailChange = () => {
            UserService.forceChangeUserEmail(
                props.userId,
                email.value
            ).then(() => {
                dialog.value = false;
                emit("update", props.presetEmail, email.value);
            });
        };

        return {
            isFormValid,
            emailFieldRules,
            forceEmailChange,
            dialog, email
        };
    }
});
</script>
