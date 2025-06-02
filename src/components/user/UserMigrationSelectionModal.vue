<template>
    <div class="d-flex flex-row justify-start" style="width: 100%;">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-list-item
                    v-if="!readOnly"
                    v-bind="scope.props" :disabled="readOnly"
                    v-on="scope.isActive">
                    <v-list-item-title>{{ $t("migrateDataLabel") }}</v-list-item-title>
                </v-list-item>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("migrateDataLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col>
                                    <user-autocomplete-search
                                        v-model="selectedUser"
                                        required
                                        :allowed-roles="allowedRoles">
                                    </user-autocomplete-search>
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
                        :disabled="!isFormValid || migrateFromId === selectedUser?.value"
                        @click="migrate">
                        {{ $t("migrateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import UserAutocompleteSearch from "./UserAutocompleteSearch.vue";
import UserService from "@/services/UserService";


export default defineComponent({
    name: "UserMigrationSelectionModal",
    components: { UserAutocompleteSearch },
    props: {
        allowedRoles: {
            type: Array<string>,
            default: []
        },
        migrateFromId: {
            type: Number,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    emits: ["migrate"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const selectedUser = ref<{title: string, value: number}>();

        const migrate = () => {
            UserService.migrateUserData(
                selectedUser.value?.value as number,
                props.migrateFromId
            ).then(() => {
                dialog.value = false;
                emit("migrate", selectedUser.value?.title.split("|")[0]);
            });
        };

        return {
            isFormValid,
            selectedUser,
            migrate, dialog
        };
    }
});
</script>
