<template>
    <v-card min-width="150">
        <v-list v-if="notifications.length > 0">
            <v-list-subheader>{{ $t("recentNotificationsLabel") }}</v-list-subheader>

            <v-list-item
                v-for="(notification, i) in notifications"
                :key="i"
                :value="notification.id"
                color="secondary"
                @click="navigateToNotificationPage"
            >
                <v-row>
                    <v-col cols="10">
                        <v-list-item-media>{{ notification.notificationText }}</v-list-item-media>
                    </v-col>
                    <v-col cols="1">
                        <v-list-item-action v-for="(notificationAction, index) in notification.possibleActions" :key="index">
                            <v-btn icon @click.stop="performAction(notification.id, notificationAction)">
                                <v-icon v-if="notificationAction.toString() === 'APPROVE'">
                                    mdi-check
                                </v-icon>
                                <v-icon v-if="notificationAction.toString() === 'REMOVE_FROM_PUBLICATION'">
                                    mdi-file-remove-outline
                                </v-icon>
                                <v-icon v-if="notificationAction.toString() === 'PERFORM_DEDUPLICATION'">
                                    mdi-content-duplicate
                                </v-icon>
                                <v-icon v-else>
                                    mdi-eye-outline
                                </v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-col>
                    <v-col cols="1">
                        <v-list-item-action>
                            <v-btn icon @click.stop="rejectNotification(notification.id)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-col>    
                </v-row>
            </v-list-item>
        </v-list>
        <h3 v-else class="ml-4 pr-4">
            {{ $t("noNewNotificationsMessage") }}
        </h3>
    </v-card>
</template>
  
<script lang="ts">
import { useInterval } from '@/composables/useInterval';
import { NotificationAction } from '@/models/Common';
import type { Notification } from '@/models/Common';
import NotificationService from '@/services/NotificationService';
import { useNotificationCountStore } from '@/stores/notificationCountStore';
import { defineComponent, onMounted, ref } from 'vue';  
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "NotificationList",
    setup() {
        const notifications = ref<Notification[]>([]);
        const notificationCountStore = useNotificationCountStore();

        const router = useRouter();

        onMounted(() => {
            fetchNotificationsAndCounts();

            // Fetch notifications and counts every 5 minutes
            useInterval(fetchNotificationsAndCounts, 1000 * 60 * 5);
        });

        const fetchNotificationsAndCounts = () => {
            NotificationService.getAllNotifications().then(response => {
                notifications.value = response.data;
            });
            
            NotificationService.getNotificationCount().then(response => {
                notificationCountStore.setNotificationCount(response.data);
            });
        };
    
        const performAction = (notificationId: number, action: NotificationAction) => {
            NotificationService.performAction(notificationId, action).then(() => {
                removeHandledNotification(notificationId);
                notificationCountStore.decrementCounter();
            });

            if (action === NotificationAction.PERFORM_DEDUPLICATION) {
                decrementCounterAndNavigateToPage("deduplication");
            } else if (action === NotificationAction.BROWSE_CLAIMABLE_DOCUMENTS) {
                decrementCounterAndNavigateToPage("documentClaim");
            } else if (action === NotificationAction.PERFORM_EVENT_CLASSIFICATION) {
                decrementCounterAndNavigateToPage("events");
            } else if (action === NotificationAction.PERFORM_DOCUMENT_ASSESSMENT) {
                decrementCounterAndNavigateToPage("scientificResults");
            } else if (action === NotificationAction.PROMOTION_NOTIFICATION) {
                decrementCounterAndNavigateToPage("registryBookList");
            }
        };

        const decrementCounterAndNavigateToPage = (pageName: string) => {
            notificationCountStore.decrementCounter();
            router.push({name: pageName});
        };

        const rejectNotification = (notificationId: number) => {
            NotificationService.dismissNotification(notificationId).then(() => {
                removeHandledNotification(notificationId);
            });
        };

        const removeHandledNotification = (notificationId: number) => {
            notifications.value = notifications.value.filter(notification => notification.id != notificationId);
            notificationCountStore.decrementCounter();
        };

        const navigateToNotificationPage = () => {
            router.push({ name: "notifications" });
        };

        return {
            performAction,
            notifications,
            rejectNotification,
            notificationCountStore,
            navigateToNotificationPage
        };
}});
</script>
  