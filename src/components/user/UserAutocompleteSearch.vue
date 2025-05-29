<template>
    <v-row>
        <v-col :cols="(hasSelection ? 11 : 12)">
            <v-autocomplete
                v-model="selectedUser"
                :label="(label ? $t(label) : (multiple ? $t('userListLabel') : $t('userLabel'))) + (required ? '*' : '')"
                :items="users"
                :custom-filter="((): boolean => true)"
                :rules="requiredSelectionRules"
                :no-data-text="$t('noDataMessage')"
                :multiple="multiple"
                return-object
                @update:search="searchUsers($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref, computed } from 'vue';
import lodash from "lodash";
import UserService from '@/services/UserService';
import type { UserAccountIndex } from '@/models/UserModel';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';


export default defineComponent({
    name: "UserAutocompleteSearch",
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        multiple: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: [Object, Array] as PropType<
                { title: string, value: number } | { title: string, value: number }[] | undefined
            >,
            required: true,
        },
        allowedRoles: {
            type: Array<string>,
            default: []
        },
        label: {
            type: String,
            default: ""
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const searchPlaceholder = props.multiple ? [] : {title: "", value: -1};

        const users = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedUser = ref(
            props.multiple ? (props.modelValue as any[] || []) : (props.modelValue || searchPlaceholder)
        );

        onMounted(() => {
            if (props.modelValue) {
                selectedUser.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchUsers = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                UserService.searchUsers(params, props.allowedRoles).then((response) => {
                    const listOfUsers: { title: string, value: number }[] = [];
                    response.data.content.forEach((user: UserAccountIndex) => {
                        listOfUsers.push({title: `${user.fullName} | ${user.email} | ${getTitleFromValueAutoLocale(user.userRole)}`, value: user.databaseId});
                    })
                    users.value = listOfUsers;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedUser.value);
        };

        watch(() => props.modelValue, () => {
            if (props.modelValue) {
                selectedUser.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedUser.value = searchPlaceholder;
            sendContentToParent();
        };

        const hasSelection = computed(() =>
            props.multiple ? (selectedUser.value as any[]).length > 0 : (selectedUser.value as { title: '', value: -1 }).value !== -1
        );

        return {
            users, selectedUser, searchUsers,
            requiredSelectionRules,
            sendContentToParent,
            clearInput, hasSelection
        };
    }
});
</script>
