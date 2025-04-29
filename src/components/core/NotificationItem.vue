<template>
    <div class="text-center">
        <v-menu
            v-model="menu"
            :close-on-content-click="true"
            location="bottom"
        >
            <template #activator="{ props }">
                <v-btn
                    v-bind="props"
                    icon="mdi-translate"
                >
                    <v-badge :content="notificationCountStore.notificationCount" :model-value="notificationCountStore.notificationCount > 0">
                        <v-icon left dark>
                            mdi-bell
                        </v-icon>
                    </v-badge>
                </v-btn>
            </template>

            <notification-list></notification-list>
        </v-menu>
    </div>
</template>
  
<script lang="ts">
import NotificationService from '@/services/NotificationService';
import { defineComponent, onMounted } from 'vue';  
import NotificationList from './NotificationList.vue';
import { useNotificationCountStore } from '@/stores/notificationCountStore';
import { useInterval } from '@/composables/useInterval';


export default defineComponent({
    name: "NotificationItem",
    components: { NotificationList },
    setup() {
        const notificationCountStore = useNotificationCountStore();

        onMounted(() => {
            fetchCount();

            // Fetch notification count every 5 minutes
            useInterval(fetchCount, 1000 * 60 * 5);
        });

        const fetchCount = () => {
            NotificationService.getNotificationCount().then(response => {
                notificationCountStore.setNotificationCount(response.data);
            });
        };

        return {
            notificationCountStore
        };
},
data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
}),
});
</script>
  
<style scoped>
label {
    cursor: pointer;
    padding: 0.5em;
    margin: 0.2em;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: inline-block;
}
</style>
  