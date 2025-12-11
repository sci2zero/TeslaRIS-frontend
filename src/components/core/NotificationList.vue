<template>
    <v-card min-width="150">
        <v-list v-if="notifications.length > 0">
            <v-list-subheader>
                <div class="flex flex-row justify-between w-150">
                    <strong>{{ $t("recentNotificationsLabel") }}</strong>
                    <v-btn
                        class="ml-3! mb-1!"
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
                <div class="flex items-center justify-between">
                    <div>
                        <v-list-item-media>{{ notification.notificationText }}</v-list-item-media>
                    </div>
                    <div class="flex justify-center ml-3 mr-1 mb-1 mt-1">
                        <v-list-item-action v-for="(notificationAction, index) in notification.possibleActions" :key="index">
                            <v-btn icon @click.stop="performAction(notification.id, notificationAction)">
                                <v-icon v-if="notificationAction.toString() === 'APPROVE'">
                                    mdi-check
                                </v-icon>
                                <v-icon v-else-if="notificationAction.toString() === 'REMOVE_FROM_PUBLICATION' || notificationAction.toString() === 'REMOVE_EMPLOYEES_FROM_PUBLICATION'">
                                    mdi-file-remove-outline
                                </v-icon>
                                <v-icon v-else-if="notificationAction.toString() === 'PERFORM_DEDUPLICATION'">
                                    mdi-content-duplicate
                                </v-icon>
                                <v-icon v-else-if="notificationAction.toString() === 'RETURN_TO_PUBLICATION'">
                                    mdi-restart
                                </v-icon>
                                <v-icon v-else>
                                    mdi-eye-outline
                                </v-icon>
                            </v-btn>
                        </v-list-item-action>
                        <v-list-item-action class="ml-2">
                            <v-btn icon @click.stop="rejectNotification(notification.id)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </div>  
                </div>
            </v-list-item>
        </v-list>

        <v-list v-else-if="loading">
            <v-list-item v-for="i in 5" :key="i" class="wide-skeleton">
                <v-skeleton-loader
                    type="text@2"
                />
            </v-list-item>
        </v-list>

        <h4 v-else class="ml-4 pr-4">
            {{ $t("noNewNotificationsMessage") }}
        </h4>
    </v-card>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="dialogMessage"
        @continue="continueToAction"
    />
</template>
  
<script lang="ts">
import { NotificationAction } from '@/models/Common';
import type { Notification } from '@/models/Common';
import NotificationService from '@/services/NotificationService';
import { useNotificationCountStore } from '@/stores/notificationCountStore';
import { defineComponent, onMounted, ref } from 'vue';  
import { useRouter } from 'vue-router';
import PersistentQuestionDialog from './comparators/PersistentQuestionDialog.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "NotificationList",
    components: { PersistentQuestionDialog },
    setup() {
        const notifications = ref<Notification[]>([]);
        const notificationCountStore = useNotificationCountStore();

        const router = useRouter();
        const loading = ref(false);

        const i18n = useI18n();

        const displayPersistentDialog = ref(false);
        const dialogMessage = ref("");
        const selectedNotificationId = ref<number>(0);
        const selectedNotificationAction = ref<NotificationAction | undefined>();

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
            } else if (action === NotificationAction.GO_TO_VALIDATION_PAGE) {
                decrementCounterAndNavigateToPage("publicationsValidation");
            } else if (action === NotificationAction.GO_TO_UNBINDED_PUBLICATIONS_PAGE) {
                notificationCountStore.decrementCounter();
                router.push({name: "scientificResults", query: {unmanaged: "true"}});
            } else {
                const message = getMessageBasedOnAction(notificationId, action);
                if (!message) {
                    return;
                }

                dialogMessage.value = message;
                selectedNotificationId.value = notificationId;
                selectedNotificationAction.value = action;

                displayPersistentDialog.value = true;
            }
        };

        const continueToAction = () => {
            if (!selectedNotificationAction.value) {
                return;
            }

            NotificationService.performAction(
                selectedNotificationId.value, 
                selectedNotificationAction.value
            ).then((response) => {
                dialogMessage.value = "";
                
                removeHandledNotification(selectedNotificationId.value);
                notificationCountStore.decrementCounter();

                selectedNotificationId.value = 0;
                selectedNotificationAction.value = undefined;

                if (response.data.value) {
                    router.push('/' + response.data.value);
                }
            });
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

        const getMessageBasedOnAction = (notificationId: number, action: NotificationAction) => {
            const notification = notifications.value.find(n => n.id === notificationId);

            if (!notification) {
                return null;
            }

            if (action === NotificationAction.APPROVE) {
                return i18n.t("addNewOtherNameActionMessage", [notification.displayValue]);   
            } else if (action === NotificationAction.REMOVE_FROM_PUBLICATION) {
                return i18n.t("removeFromPublicationActionMessage", [notification.displayValue]);   
            } else if (action === NotificationAction.REMOVE_EMPLOYEES_FROM_PUBLICATION) {
                return i18n.t("unbindEmployeesActionMessage", [notification.displayValue]); 
            } else if (action === NotificationAction.RETURN_TO_PUBLICATION) {
                return i18n.t("returnToPublicationActionMessage", [notification.displayValue]); 
            }

            return null;
        };

        return {
            performAction,
            notifications,
            rejectNotification,
            notificationCountStore,
            navigateToNotificationPage,
            loading, dismissAllNotifications,
            displayPersistentDialog,
            continueToAction, dialogMessage
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
