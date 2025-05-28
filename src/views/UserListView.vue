<template>
    <v-container>
        <h1>{{ $t("userListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <user-table-component
            v-else
            ref="tableRef"
            :users="users"
            :total-users="totalUsers"
            @switch-page="switchPage">
        </user-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import UserService from '@/services/UserService';
import UserTableComponent from '@/components/user/UserTableComponent.vue';
import { ref } from 'vue';
import type { UserAccountIndex } from '@/models/UserModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "UserListView",
    components: { SearchBarComponent, UserTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const users = ref<UserAccountIndex[]>([]);
        const totalUsers = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof UserTableComponent>();

        onMounted(() => {
            document.title = i18n.t("userListLabel");
            loading.value = true;
        });

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
            search(tokenParams);
        };

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            UserService.searchUsers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`, [])
            .then((response) => {
                users.value = response.data.content;
                totalUsers.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        };

        return {
            search, users, totalUsers, switchPage,
            clearSortAndPerformSearch, tableRef,
            loading
        };
    }
});
</script>
