<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-btn
                    density="compact" class="bottom-spacer ml-3" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ $t("addSubUnitLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addSubUnitLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col>
                                    <organisation-unit-autocomplete-search
                                        v-model="selectedOU"
                                        required
                                        only-independent-institutions
                                    />
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="saveSubUnit">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <toast v-model="snackbar" :message="message" />
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import OrganisationUnitAutocompleteSearch from "./OrganisationUnitAutocompleteSearch.vue";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import Toast from "../core/Toast.vue";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "AddSubUnitModal",
    components: { OrganisationUnitAutocompleteSearch, Toast },
    props: {
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        const searchPlaceholder = {title: "", value: -1};
        const selectedOU = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredSelectionRules } = useValidationUtils();

        const saveSubUnit = () => {
            OrganisationUnitService.addSubUnit(
                props.institutionId, selectedOU.value.value
            ).then(() => {
                emit("update", true);
                dialog.value = false;
            }).catch(error => {
                if (error.response.status === 409) {
                    message.value = i18n.t(error.response.data.message as string);
                    snackbar.value = true;
                }
            });
        };

        return {
            dialog, selectedOU,
            saveSubUnit, isFormValid,
            requiredSelectionRules,
            snackbar, message
        };
    }
});
</script>
