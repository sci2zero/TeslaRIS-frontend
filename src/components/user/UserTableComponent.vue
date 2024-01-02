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
                    <v-btn color="blue" dark>
                        {{ row.item.active ? "Deactivate" : "Activate" }}
                    </v-btn>
                    <v-btn color="blue" dark style="margin-left: 10px;">
                        Take Role
                    </v-btn>
                </td>
            </tr>
        </template>
    </v-data-table-server>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "UserTableComponent",
    props: {
        users: {
            type: Array,
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
        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const emailLabel = computed(() => i18n.t("emailLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const roleLabel = computed(() => i18n.t("roleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

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

        const refreshTable = (event) => {
            let sortField = "";
            let sortDir = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir)
        }

        return {selectedUsers, headers, refreshTable};
    }
});
</script>