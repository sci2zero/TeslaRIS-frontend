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
                </v-btn>
            </template>

            <v-card min-width="150">
                <v-list>
                    <v-list-subheader>Recent notifications</v-list-subheader>

                    <v-list-item
                        v-for="(notification, i) in notifications"
                        :key="i"
                        :value="notification.id"
                        color="secondary"
                    >
                        <v-list-item-title>{{ notification.notificationText }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>
    </div>
</template>
  
<script lang="ts">
import type { Notification } from '@/models/Common';
import NotificationService from '@/services/NotificationService';
import { defineComponent, onMounted, ref } from 'vue';  

export default defineComponent({
    name: "NotificationItem",
    setup() {
        const notifications = ref<Notification[]>([]);

        onMounted(() => {
            NotificationService.getAllNotifications().then(response => {
                notifications.value = response.data;
            });
        });
    
        const approveNotification = {

        };

        const rejectNotification = {

        };

        return {
            approveNotification,
            notifications,
            rejectNotification
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
  