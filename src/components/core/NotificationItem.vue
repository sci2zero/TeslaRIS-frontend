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
                    :color="variant === 'general' ? '#222' : 'white'"
                    variant="text"
                    icon="mdi-translate"
                >
                    <v-badge
                        style="z-index: 5;"
                        :content="notificationCountStore.notificationCount"
                        :model-value="notificationCountStore.notificationCount > 0">
                        <v-icon left :class="variant === 'general' ? 'text-dark' : 'dark'">
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
    props: {
        variant: {
            type: String as () => 'general' | 'home',
            default: 'home'
        }
    },
    setup() {
        const notificationCountStore = useNotificationCountStore();

        onMounted(() => {
            fetchCount();
            startInterval();
        });

        const fetchCount = () => {
            NotificationService.getNotificationCount().then(response => {
                notificationCountStore.setNotificationCount(response.data);
            });
        };

        // Fetch notification count every 30 seconds
        const { startInterval } = useInterval(fetchCount, 1000 * 30);

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
  