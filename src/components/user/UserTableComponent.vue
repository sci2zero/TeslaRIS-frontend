<template>
    <v-row class="mb-5">
        <v-menu open-on-hover>
            <template #activator="{ props }">
                <v-btn
                    color="primary"
                    v-bind="props"
                >
                    {{ $t("addEmployeeLabel") }}
                </v-btn>
            </template>

            <v-list>
                <register-employee-modal
                    :employee-role="UserRole.INSTITUTIONAL_EDITOR"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification"
                />
                <register-employee-modal
                    :employee-role="UserRole.VICE_DEAN_FOR_SCIENCE"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification" 
                />
                <register-employee-modal
                    :employee-role="UserRole.COMMISSION"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification"
                />
                <register-employee-modal
                    :employee-role="UserRole.INSTITUTIONAL_LIBRARIAN"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification"
                />
                <register-employee-modal
                    :employee-role="UserRole.HEAD_OF_LIBRARY"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification"
                />
                <register-employee-modal
                    :employee-role="UserRole.PROMOTION_REGISTRY_ADMINISTRATOR"
                    @success="refreshTable(tableOptions)"
                    @failure="displayFormNotification"
                />
            </v-list>
        </v-menu>
    </v-row>

    <v-row>
        <v-data-table-server
            :sort-by="tableOptions.sortBy"
            :items="users"
            :headers="headers"
            :items-length="totalUsers"
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td>{{ row.item.fullName }}</td>
                    <td>{{ row.item.email }}</td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ displayTextOrPlaceholder(row.item.organisationUnitNameSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.organisationUnitNameOther) }}
                    </td>
                    <td>{{ getTitleFromValueAutoLocale(row.item.userRole) }}</td>
                    <td>
                        <div class="d-flex flex-row justify-start">
                            <v-btn
                                color="blue"
                                dark
                                :disabled="row.item.userRole === 'ADMIN'"
                                @click="changeActivationStatus(row.item.databaseId)">
                                {{ row.item.active ? $t("deactivateAccountLabel") : $t("activateAccountLabel") }}
                            </v-btn>
                            <v-btn
                                color="blue" dark class="inline-action"
                                :disabled="!accountsThatAllowedRoleTaking.includes(row.item.databaseId) || row.item.userRole === 'ADMIN'"
                                @click="takeRoleOfUser(row.item.email)">
                                {{ $t("takeRoleLabel") }}
                            </v-btn>
                            <v-menu
                                :close-on-content-click="true"
                                location="bottom"
                            >
                                <template #activator="{ props }">
                                    <div
                                        class="inline-action">
                                        <v-btn
                                            v-bind="props"
                                            compact dark
                                            color="blue">
                                            ...
                                        </v-btn>
                                    </div>
                                </template>

                                <v-list min-width="150">
                                    <v-list-item
                                        @click="generateNewPassword(row.item.databaseId)">
                                        <v-list-item-title>{{ $t("generateNewPasswordLabel") }}</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item
                                        v-if="row.item.userRole != 'ADMIN'"
                                        @click="deleteUser(row.item.databaseId, row.item.fullName)">
                                        <v-list-item-title>{{ $t("deleteLabel") }}</v-list-item-title>
                                    </v-list-item>
                                    <user-migration-selection-modal
                                        v-if="row.item.userRole === 'COMMISSION' || row.item.userRole === 'RESEARCHER'"
                                        :migrate-from-id="row.item.databaseId"
                                        :allowed-roles="[row.item.userRole]"
                                        @migrate="notifyUserAboutMigration">
                                    </user-migration-selection-modal>
                                </v-list>
                            </v-menu>
                        </div>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </v-row>
    
    <toast v-model="snackbar" :message="snackbarText" />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserService from '@/services/UserService';
import { UserRole, type UserAccountIndex } from '@/models/UserModel';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/stores/loginStore';
import RegisterEmployeeModal from '@/components/user/RegisterEmployeeModal.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import Toast from '../core/Toast.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import UserMigrationSelectionModal from './UserMigrationSelectionModal.vue';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "UserTableComponent",
    components: { RegisterEmployeeModal, Toast, UserMigrationSelectionModal },
    props: {
        users: {
            type: Array<UserAccountIndex>,
            required: true
        }, 
        totalUsers: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const loginStore = useLoginStore();
        const router = useRouter();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const accountsThatAllowedRoleTaking = ref<number[]>([]);

        onMounted(() => {
            UserService.getAccountsWithRoleTakingAllowed().then(response => {
                accountsThatAllowedRoleTaking.value = response.data;
            });
        });

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const emailLabel = computed(() => i18n.t("emailLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const roleLabel = computed(() => i18n.t("roleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const actionFailedNotification = computed(() => i18n.t("actionFailedNotification"));
        const successfulltUpdatedNotification = computed(() => i18n.t("successfulltUpdatedNotification"));
        const userDidNotAllowNotification = computed(() => i18n.t("userDidNotAllowNotification"));

        const ouColumn = computed(() => i18n.t("organisationUnitNameColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "fullName", order: "asc"}]});

        const headers = ref<any>([
          { title: fullNameLabel, align: "start", sortable: true, key: "fullName"},
          { title: emailLabel, align: "start", sortable: true, key: "email"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: ouColumn},
          { title: roleLabel, align: "start", sortable: true, key: "userRole"},
          { title: actionLabel},
        ]);

        const headersSortableMappings: Map<string, string> = new Map([
            ["fullName", "full_name_sortable"],
            ["email", "email_sortable"],
            ["organisationUnitNameSr", "org_unit_name_sortable_sr"],
            ["organisationUnitNameOther", "org_unit_name_sortable_other"],
            ["userRole", "user_role"],
        ]);

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }
            tableOptions.value = event;
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const changeActivationStatus = (userId: number) => {
            UserService.updateAccountActivationStatus(userId).then(() => {
                snackbarText.value = successfulltUpdatedNotification.value;
                snackbar.value = true;
                props.users.forEach((user: UserAccountIndex) => {
                    if (user.databaseId === userId) {
                        user.active = !user.active;
                    }
                });
            }).catch(() => {
                snackbarText.value = actionFailedNotification.value;
                snackbar.value = true;
            });
        };

        const displayFormNotification = (text: string) => {
            snackbarText.value = text;
            snackbar.value = true;
        }

        const takeRoleOfUser = (email: string) => {
            UserService.takeRoleOfAccount({userEmail: email}).then((response) => {
                localStorage.setItem("jwt", response.data.token);
                localStorage.setItem("refreshToken", response.data.refreshToken);

                loginStore.emitLoginSuccess();
                router.push({ name: "home" }).then(() => {
                    window.location.reload();
                });
            }).catch(() => {
                snackbar.value = true;
                snackbarText.value = userDidNotAllowNotification.value;
            });
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: "fullName", order: "asc"}], tableOptions.value.sortBy) ||
                    tableOptions.value.sortBy.length === 0
                ) &&
                page == tableOptions.value.page
            ) {
                return
            }
            
            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        const generateNewPassword = (userId: number) => {
            UserService.generateNewUserPassword(userId).then(response => {
                if (response.data) {
                    snackbarText.value = i18n.t("passwordResetSuccessMessage");
                } else {
                    snackbarText.value = i18n.t("functionalityNotAvailableMessage");
                }
                snackbar.value = true;
            }).catch((error) => {
                snackbarText.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const deleteUser = (userId: number, personName: string) => {
            UserService.deleteUser(userId).then(() => {
                snackbarText.value = i18n.t("deleteSuccessNotification", { name: personName });
                snackbar.value = true;
                refreshTable(tableOptions.value);
            }).catch((error) => {
                snackbarText.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const notifyUserAboutMigration = (migratedToName: string) => {
            snackbarText.value = i18n.t("migratedDataToMessage", [migratedToName]);
            snackbar.value = true;
        };

        return {
            headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, changeActivationStatus, takeRoleOfUser,
            displayFormNotification, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, setSortAndPageOption,
            accountsThatAllowedRoleTaking, UserRole, deleteUser,
            generateNewPassword, notifyUserAboutMigration
        };
    }
});
</script>