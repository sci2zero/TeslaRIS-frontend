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
                    <v-badge :content="notificationCount" :model-value="notificationCount > 0">
                        <v-icon left dark>
                            mdi-bell
                        </v-icon>
                    </v-badge>
                </v-btn>
            </template>

            <notification-list @lower-count="notificationCount -= 1;"></notification-list>
        </v-menu>
    </div>
</template>
  
<script lang="ts">
import NotificationService from '@/services/NotificationService';
import { defineComponent, onMounted, ref } from 'vue';  
import NotificationList from './NotificationList.vue';


export default defineComponent({
    name: "NotificationItem",
    components: { NotificationList },
    setup() {
        const notificationCount = ref(0);

        onMounted(() => {
            fetchCount();

            // Fetch notification count every 5 minutes
            setInterval(fetchCount, 1000 * 60 * 5);
        });

        const fetchCount = () => {
            NotificationService.getNotificationCount().then(response => {
                notificationCount.value = response.data;
            });
        };

        return {
            notificationCount
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
  