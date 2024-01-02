<template>
    <h1>{{ $t("userListLabel") }}</h1>
    <br />
    <br />
    <search-bar-component @search="search"></search-bar-component>
    <br />
    <br />
    <br />
    <user-table-component :users="users" :total-users="totalUsers" @switch-page="switchPage"></user-table-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import UserService from '@/services/UserService';
import UserTableComponent from '@/components/user/UserTableComponent.vue';
import { ref } from 'vue';

export default defineComponent({
    name: "UserListView",
    components: {SearchBarComponent, UserTableComponent},
    setup() {
        const searchParams = ref("tokens=*");
        const users = ref([]);
        const totalUsers = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            UserService.searchUsers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                console.log(response.data.totalElements);
                users.value = response.data.content;
                totalUsers.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        return {search, users, totalUsers, switchPage};
    }
});
</script>
