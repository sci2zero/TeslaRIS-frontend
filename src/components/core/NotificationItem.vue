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

            <v-card min-width="150">
                <v-list>
                    <v-list-subheader>{{ $t("recentNotificationsLabel") }}</v-list-subheader>

                    <v-list-item
                        v-for="(notification, i) in notifications"
                        :key="i"
                        :value="notification.id"
                        color="secondary"
                    >
                        <v-row>
                            <v-col cols="10">
                                <v-list-item-media>{{ notification.notificationText }}</v-list-item-media>
                            </v-col>
                            <v-col cols="1">
                                <v-list-item-action v-for="(notificationAction, index) in notification.possibleActions" :key="index">
                                    <v-btn icon @click="performAction(notification.id, notificationAction)">
                                        <v-icon v-if="notificationAction.toString() === 'APPROVE'">
                                            mdi-check
                                        </v-icon>
                                        <v-icon v-if="notificationAction.toString() === 'REMOVE_FROM_PUBLICATION'">
                                            mdi-file-remove-outline
                                        </v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-col>
                            <v-col cols="1">
                                <v-list-item-action>
                                    <v-btn icon @click="rejectNotification(notification.id)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-col>    
                        </v-row>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>
    </div>
</template>
  
<script lang="ts">
import type { Notification, NotificationAction } from '@/models/Common';
import NotificationService from '@/services/NotificationService';
import { defineComponent, onMounted, ref } from 'vue';  

export default defineComponent({
    name: "NotificationItem",
    setup() {
        const notifications = ref<Notification[]>([]);
        const notificationCount = ref(0);

        onMounted(() => {
            NotificationService.getAllNotifications().then(response => {
                notifications.value = response.data;
            });
            NotificationService.getNotificationCount().then(response => {
                    notificationCount.value = response.data;
            });
        });
    
        const performAction = (notificationId: number, action: NotificationAction) => {
            NotificationService.performAction(notificationId, action).then(() => {
                removeHandledNotification(notificationId);
            });
        };

        const rejectNotification = (notificationId: number) => {
            NotificationService.rejectNotification(notificationId).then(() => {
                removeHandledNotification(notificationId);
            });
        };

        const removeHandledNotification = (notificationId: number) => {
            notifications.value = notifications.value.filter(notification => notification.id != notificationId);
            notificationCount.value -= 1;
        };

        return {
            performAction,
            notifications,
            rejectNotification,
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
  