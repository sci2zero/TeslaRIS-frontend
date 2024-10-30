<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-btn
                    density="compact" class="bottom-spacer ml-3" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ isUpdate ? $t("updateCountryLabel") : $t("createNewCountryLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isUpdate ? $t("updateCountryLabel") : $t("createNewCountryLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <country-form ref="updateFormRef" :preset-country="presetCountry" @create="emitToParent"></country-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.submit()">
                        {{ isUpdate ? $t("updateLabel") : $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import CountryForm from "./CountryForm.vue";
import type { Country } from "@/models/Common";


export default defineComponent({
    name: "CountryModal",
    components: { CountryForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetCountry: {
            type: Object as PropType<Country | undefined>,
            required: true
        },
        isUpdate: {
            type: Boolean,
            default: false
        }
    },
    emits: ["submit"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof CountryForm>();

        const emitToParent = (country: Country) => {
            emit("submit", country)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>
