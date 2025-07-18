<template>
    <v-card min-width="150">
        <v-list v-if="notifications.length > 0">
            <v-list-subheader class="w-100">
                <div class="d-flex flex-row justify-space-between w-100">
                    <strong>{{ $t("recentNotificationsLabel") }}</strong>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="ml-3 mb-1"
                        density="compact"
                        color="primary"
                        @click="dismissAllNotifications">
                        {{ $t("dismissAllLabel") }}
                    </v-btn>
                </div>
            </v-list-subheader>

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
                                <v-icon v-else-if="notificationAction.toString() === 'REMOVE_FROM_PUBLICATION'">
                                    mdi-file-remove-outline
                                </v-icon>
                                <v-icon v-else-if="notificationAction.toString() === 'PERFORM_DEDUPLICATION'">
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

        <v-list v-else-if="loading">
            <v-list-item v-for="i in 5" :key="i" class="wide-skeleton">
                <v-skeleton-loader
                    type="text@2"
                />
            </v-list-item>
        </v-list>

        <h3 v-else class="ml-4 pr-4">
            {{ $t("noNewNotificationsMessage") }}
        </h3>
    </v-card>
</template>
  
<script lang="ts">
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
        const loading = ref(false);

        onMounted(() => {
            loading.value = true;
            fetchNotificationsAndCounts();
        });

        const fetchNotificationsAndCounts = () => {
            NotificationService.getAllNotifications().then(response => {
                notifications.value = response.data;
                loading.value = false;
            });
            
            NotificationService.getNotificationCount().then(response => {
                notificationCountStore.setNotificationCount(response.data);
            });
        };
    
        const performAction = (notificationId: number, action: NotificationAction) => {
            NotificationService.performAction(notificationId, action).then((response) => {
                removeHandledNotification(notificationId);
                notificationCountStore.decrementCounter();
                if (response.data.value) {
                    router.push('/' + response.data.value);
                }
            });

            if (action === NotificationAction.PERFORM_DEDUPLICATION) {
                decrementCounterAndNavigateToPage("deduplication");
            } else if (action === NotificationAction.BROWSE_CLAIMABLE_DOCUMENTS) {
                decrementCounterAndNavigateToPage("documentClaim");
            } else if (action === NotificationAction.PERFORM_EVENT_CLASSIFICATION) {
                decrementCounterAndNavigateToPage("events");
            } else if (action === NotificationAction.PERFORM_DOCUMENT_ASSESSMENT) {
                decrementCounterAndNavigateToPage("scientificResults");
            } else if (action === NotificationAction.GO_TO_PROMOTIONS_PAGE) {
                decrementCounterAndNavigateToPage("registryBookList");
            } else if (action === NotificationAction.GO_TO_HARVESTER_PAGE) {
                decrementCounterAndNavigateToPage("importer");
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

        const dismissAllNotifications = () => {
            NotificationService.dismissAllNotifications().then(() => {
                notifications.value.splice(0);
                notificationCountStore.setNotificationCount(0);
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
            navigateToNotificationPage,
            loading, dismissAllNotifications
        };
}});
</script>

<style>

.wide-skeleton {
    min-width: 400px;
}

.w-100 > div.v-list-subheader > div {
    width: 100%;
}

</style>
