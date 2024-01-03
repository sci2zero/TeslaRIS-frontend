<template>
    <v-data-table-server
        v-model="selectedUsers"
        :items="users"
        :headers="headers"
        item-value="id"
        search=""
        :items-length="totalUsers"
        :items-per-page="10"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>{{ row.item.fullName }}</td>
                <td>{{ row.item.email }}</td>
                <td>{{ row.item.organisationUnitNameSr }}</td>
                <td>{{ row.item.userRole }}</td>
                <td>
                    <v-btn color="blue" dark @click="changeActivationStatus(row.item.databaseId)">
                        {{ row.item.active ? "Deactivate" : "Activate" }}
                    </v-btn>
                    <v-btn color="blue" dark style="margin-left: 10px;" @click="takeRoleOfUser(row.item.email)">
                        Take Role
                    </v-btn>
                </td>
            </tr>
        </template>
    </v-data-table-server>
    <v-snackbar
        v-model="snackbar"
        :timeout="timeout">
        {{ snackbarText }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserService from '@/services/UserService';
import type { UserAccountIndex } from '@/models/UserModel';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/stores/loginStore';

export default defineComponent({
    name: "UserTableComponent",
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
        const selectedUsers = ref([]);

        const i18n = useI18n();
        const loginStore = useLoginStore();
        const router = useRouter();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const emailLabel = computed(() => i18n.t("emailLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const roleLabel = computed(() => i18n.t("roleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const actionFailedNotification = computed(() => i18n.t("actionFailedNotification"));
        const successfulltUpdatedNotification = computed(() => i18n.t("successfulltUpdatedNotification"));
        const userDidNotAllowNotification = computed(() => i18n.t("userDidNotAllowNotification"));

        const headers = [
          { title: fullNameLabel, align: "start", sortable: true, key: "fullName"},
          { title: emailLabel, align: "start", sortable: true, key: "email"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: "organisationUnitNameSr"},
          { title: roleLabel, align: "start", sortable: true, key: "userRole"},
          { title: actionLabel},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["fullName", "email_sortable"],
            ["email", "email_sortable"],
            ["organisationUnitNameSr", "email_sortable"],
            ["organisationUnitNameOther", "email_sortable"],
            ["userRole", "user_role"],
        ]);

        const refreshTable = (event: any) => {
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir)
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

        const takeRoleOfUser = (email: string) => {
            UserService.takeRoleOfAccount({userEmail: email}).then((response) => {
                sessionStorage.setItem("jwt", response.data.token);
                sessionStorage.setItem("refreshToken", response.data.refreshToken);

                loginStore.emitLoginSuccess();
                router.push({ name: "home" });
            }).catch(() => {
                snackbar.value = true;
                snackbarText.value = userDidNotAllowNotification.value;
            });
        };

        return {selectedUsers, headers, snackbar, snackbarText, timeout, refreshTable, changeActivationStatus, takeRoleOfUser};
    }
});
</script>