<template>
    <v-card class="notification-panel" :class="{ 'notification-panel--compact': compact }" variant="outlined" rounded="xl">
        <header class="notification-header">
            <div class="notification-heading">
                <v-icon icon="mdi-bell-outline" size="22" color="primary" />
                <h2>{{ $t('notificationPanelTitle') }}</h2>
            </div>
            <v-btn
                v-if="compact" variant="text" size="small" append-icon="mdi-arrow-right"
                @click="router.push({ name: 'notifications' })">
                {{ $t('notificationViewAll') }}
            </v-btn>
        </header>

        <div class="notification-toolbar">
            <v-tabs v-model="activeTab" color="primary" density="comfortable" :aria-label="$t('notificationPanelTitle')">
                <v-tab value="UNREAD">
                    {{ $t('notificationUnread') }}
                    <span v-if="notificationCountStore.notificationCount" class="notification-count">
                        {{ notificationCountStore.notificationCount }}
                    </span>
                </v-tab>
                <v-tab value="READ">
                    {{ $t('notificationRead') }}
                </v-tab>
            </v-tabs>
            <v-btn
                v-if="activeTab === 'UNREAD' && notificationCountStore.notificationCount > 0"
                class="notification-mark-all" variant="text" size="small" prepend-icon="mdi-check-all"
                :loading="markingAll" :disabled="loading || busyId !== null" @click="dismissAllNotifications">
                {{ $t('notificationMarkAllRead') }}
            </v-btn>
        </div>

        <v-alert
            v-if="errorMessage" class="ma-3" type="error" variant="tonal"
            density="compact" role="alert">
            {{ errorMessage }}
            <template #append>
                <v-btn variant="text" size="small" :disabled="loading || isBusy" @click="fetchNotifications(failedPage)">
                    {{ $t('retryConnectionLabel') }}
                </v-btn>
            </template>
        </v-alert>

        <div class="notification-content" :aria-busy="loading">
            <see-more-pagination
                :page="currentPage" :total-pages="totalPages" :loading="loading" :disabled="isBusy"
                @load-page="fetchNotifications">
                <div v-if="loading && !notifications.length" class="notification-skeleton" role="status" :aria-label="$t('notificationLoading')">
                    <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" />
                </div>
                <ul v-else-if="notifications.length" class="notification-list">
                    <li v-for="notification in notifications" :key="notification.id" class="notification-row" :class="{ 'notification-row--unread': !notification.readAt }">
                        <div class="notification-symbol" :class="{ 'notification-symbol--read': notification.readAt }">
                            <v-icon :icon="getSentimentIcon(notification)" :color="getSentimentColor(notification)" size="20" />
                        </div>
                        <div class="notification-body">
                            <div class="notification-meta">
                                <time :datetime="notification.creationTimestamp">{{ formatTimestamp(notification.creationTimestamp) }}</time>
                                <v-chip :color="getSentimentColor(notification)" size="x-small" variant="tonal">
                                    {{ getSentimentLabel(notification) }}
                                </v-chip>
                                <span v-if="!notification.readAt" class="notification-dot" :aria-label="$t('notificationUnread')" />
                            </div>
                            <p class="notification-text">
                                {{ notification.notificationText }}
                            </p>
                            <v-btn class="notification-message-button" variant="text" size="small" @click="messageNotification = notification">
                                {{ $t('viewDetailsLabel') }}
                            </v-btn>
                            <div v-if="!notification.readAt" class="notification-actions">
                                <v-btn
                                    v-for="action in notification.possibleActions" :key="action" class="notification-action"
                                    :prepend-icon="getActionIcon(action)" :color="getActionColor(action)" variant="tonal" size="small"
                                    :disabled="isBusy" @click="performAction(notification, action)">
                                    {{ getActionLabel(action) }}
                                </v-btn>
                                <v-btn
                                    class="notification-action" prepend-icon="mdi-check" variant="text" size="small"
                                    :loading="busyId === notification.id" :disabled="isBusy" @click="dismissNotification(notification.id)">
                                    {{ $t('notificationMarkRead') }}
                                </v-btn>
                            </div>
                            <p v-else class="notification-read-time">
                                <v-icon icon="mdi-check-all" size="14" />
                                {{ $t('notificationReadAt', { date: formatTimestamp(notification.readAt) }) }}
                            </p>
                        </div>
                    </li>
                </ul>
                <div v-else-if="!errorMessage" class="notification-empty" role="status">
                    <div class="notification-empty-icon">
                        <v-icon :icon="activeTab === 'UNREAD' ? 'mdi-check-all' : 'mdi-email-open-outline'" size="30" />
                    </div>
                    <h3>{{ $t(activeTab === 'UNREAD' ? 'notificationUnreadEmpty' : 'notificationReadEmpty') }}</h3>
                    <p>{{ $t(activeTab === 'UNREAD' ? 'notificationUnreadEmptyHint' : 'notificationReadEmptyHint') }}</p>
                </div>
            </see-more-pagination>
        </div>
    </v-card>

    <v-dialog :model-value="messageNotification !== null" max-width="680" @update:model-value="messageNotification = null">
        <v-card rounded="xl">
            <v-card-title class="notification-dialog-heading">
                <span>{{ $t('viewDetailsLabel') }}</span>
                <v-btn
                    icon="mdi-close" variant="text" size="small" :aria-label="$t('closeLabel')"
                    @click="messageNotification = null" />
            </v-card-title>
            <v-card-text class="notification-full-message">
                <template v-if="messageNotification">
                    <v-chip :color="getSentimentColor(messageNotification)" size="small" variant="tonal" class="mb-3">
                        {{ getSentimentLabel(messageNotification) }}
                    </v-chip>
                    <p>{{ messageNotification.notificationText }}</p>
                    <template v-if="messageNotification.details">
                        <v-divider class="my-4" />
                        <div>{{ messageNotification.details }}</div>
                    </template>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="messageNotification = null">
                    {{ $t('closeLabel') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog" class="notification-confirmation" :title="$t('areYouSureLabel')" :message="dialogMessage"
        @continue="continueToAction" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { NotificationAction, type Notification, type NotificationReadStatus } from '@/models/Common';
import NotificationService from '@/services/NotificationService';
import { useNotificationCountStore } from '@/stores/notificationCountStore';
import PersistentQuestionDialog from './comparators/PersistentQuestionDialog.vue';
import SeeMorePagination from './SeeMorePagination.vue';
import { localiseRelativeTimestamp } from '@/utils/DateUtil';

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const emit = defineEmits<{ (event: 'performed-action', action: NotificationAction): void }>();
const router = useRouter();
const { t } = useI18n();
const notificationCountStore = useNotificationCountStore();
const activeTab = ref<NotificationReadStatus>('UNREAD');
const notifications = ref<Notification[]>([]);
const currentPage = ref(0);
const totalPages = ref(0);
const failedPage = ref(0);
const loading = ref(false);
const errorMessage = ref('');
const busyId = ref<number | null>(null);
const markingAll = ref(false);
const isBusy = computed(() => busyId.value !== null || markingAll.value || loading.value);
const messageNotification = ref<Notification | null>(null);
const displayPersistentDialog = ref(false);
const dialogMessage = ref('');
const selectedAction = ref<{ id: number; action: NotificationAction } | null>(null);
let requestId = 0;

async function fetchNotifications(page = 0) {
    if (page > 0 && isBusy.value) return;
    const currentRequest = ++requestId;
    loading.value = true;
    if (page === 0) {
        notifications.value = [];
        currentPage.value = 0;
        totalPages.value = 0;
    }
    failedPage.value = page;
    errorMessage.value = '';
    try {
        const [list, count] = await Promise.all([
            NotificationService.getAllNotifications(activeTab.value, page),
            NotificationService.getNotificationCount()
        ]);
        // A response for a previous tab must not replace the current tab's list.
        if (currentRequest !== requestId) return;
        const existingIds = new Set(notifications.value.map(notification => notification.id));
        notifications.value.push(...list.data.content.filter(notification => !existingIds.has(notification.id)));
        currentPage.value = list.data.number;
        totalPages.value = list.data.totalPages;
        failedPage.value = 0;
        notificationCountStore.setNotificationCount(count.data);
    } catch (_error) {
        if (currentRequest === requestId) errorMessage.value = t('notificationLoadError');
    } finally {
        if (currentRequest === requestId) loading.value = false;
    }
}

watch(activeTab, () => fetchNotifications(), { immediate: true });

const navigationTargets: Partial<Record<NotificationAction, RouteLocationRaw>> = {
    [NotificationAction.PERFORM_DEDUPLICATION]: { name: 'deduplication' },
    [NotificationAction.BROWSE_CLAIMABLE_DOCUMENTS]: { name: 'documentClaim' },
    [NotificationAction.PERFORM_EVENT_CLASSIFICATION]: { name: 'events' },
    [NotificationAction.PERFORM_DOCUMENT_ASSESSMENT]: { name: 'scientificResults' },
    [NotificationAction.GO_TO_PROMOTIONS_PAGE]: { name: 'registryBookList' },
    [NotificationAction.GO_TO_HARVESTER_PAGE]: { name: 'importer' },
    [NotificationAction.GO_TO_VALIDATION_PAGE]: { name: 'publicationsValidation' },
    [NotificationAction.GO_TO_UNBINDED_PUBLICATIONS_PAGE]: { name: 'scientificResults', query: { unmanaged: 'true' } }
};

function performAction(notification: Notification, action: NotificationAction) {
    if (isBusy.value) return;
    const confirmationKeys: Partial<Record<NotificationAction, string>> = {
        [NotificationAction.APPROVE]: 'addNewOtherNameActionMessage',
        [NotificationAction.REMOVE_FROM_PUBLICATION]: 'removeFromPublicationActionMessage',
        [NotificationAction.REMOVE_EMPLOYEES_FROM_PUBLICATION]: 'unbindEmployeesActionMessage',
        [NotificationAction.RETURN_TO_PUBLICATION]: 'returnToPublicationActionMessage'
    };
    const confirmationKey = confirmationKeys[action];
    if (confirmationKey) {
        dialogMessage.value = t(confirmationKey, [notification.displayValue]);
        selectedAction.value = { id: notification.id, action };
        displayPersistentDialog.value = true;
    } else {
        executeAction(notification.id, action);
    }
}

function continueToAction() {
    if (!selectedAction.value) return;
    const { id, action } = selectedAction.value;
    selectedAction.value = null;
    executeAction(id, action);
}

async function executeAction(id: number, action: NotificationAction) {
    if (isBusy.value) return;
    busyId.value = id;
    errorMessage.value = '';
    try {
        const response = await NotificationService.performAction(id, action);
        await fetchNotifications();
        emit('performed-action', action);
        const target = navigationTargets[action];
        if (target) await router.push(target);
        else if (response.data.value) await router.push('/' + response.data.value);
    } catch (_error) {
        errorMessage.value = t('notificationActionError');
    } finally {
        busyId.value = null;
    }
}

async function dismissNotification(id: number) {
    if (isBusy.value) return;
    busyId.value = id;
    errorMessage.value = '';
    try {
        await NotificationService.dismissNotification(id);
        await fetchNotifications();
    } catch (_error) {
        errorMessage.value = t('notificationActionError');
    } finally {
        busyId.value = null;
    }
}

async function dismissAllNotifications() {
    if (isBusy.value) return;
    markingAll.value = true;
    errorMessage.value = '';
    try {
        await NotificationService.dismissAllNotifications();
        await fetchNotifications();
    } catch (_error) {
        errorMessage.value = t('notificationActionError');
    } finally {
        markingAll.value = false;
    }
}

function formatTimestamp(timestamp: string) {
    return localiseRelativeTimestamp(timestamp, t);
}

function getSentimentColor(notification: Notification) {
    switch (notification.sentiment) {
        case 'SUCCESS': return 'success';
        case 'WARNING': return 'warning';
        case 'ERROR': return 'error';
        default: return 'info';
    }
}

function getSentimentIcon(notification: Notification) {
    switch (notification.sentiment) {
        case 'SUCCESS': return 'mdi-check-circle-outline';
        case 'WARNING': return 'mdi-alert-outline';
        case 'ERROR': return 'mdi-alert-circle-outline';
        default: return notification.readAt ? 'mdi-email-open-outline' : 'mdi-email-outline';
    }
}

function getSentimentLabel(notification: Notification) {
    switch (notification.sentiment) {
        case 'SUCCESS': return t('notificationSentimentSuccess');
        case 'WARNING': return t('notificationSentimentWarning');
        case 'ERROR': return t('notificationSentimentError');
        default: return t('notificationSentimentInfo');
    }
}

function getActionIcon(action: NotificationAction) {
    switch (action) {
        case NotificationAction.APPROVE: return 'mdi-check-circle-outline';
        case NotificationAction.REMOVE_FROM_PUBLICATION:
        case NotificationAction.REMOVE_EMPLOYEES_FROM_PUBLICATION: return 'mdi-account-minus-outline';
        case NotificationAction.RETURN_TO_PUBLICATION: return 'mdi-undo';
        default: return 'mdi-arrow-right';
    }
}

function getActionColor(action: NotificationAction) {
    switch (action) {
        case NotificationAction.REMOVE_FROM_PUBLICATION:
        case NotificationAction.REMOVE_EMPLOYEES_FROM_PUBLICATION: return 'error';
        case NotificationAction.APPROVE: return 'success';
        default: return 'primary';
    }
}

function getActionLabel(action: NotificationAction) {
    switch (action) {
        case NotificationAction.APPROVE: return t('addNameVariantLabel');
        case NotificationAction.REMOVE_FROM_PUBLICATION: return t('notificationRemoveMe');
        case NotificationAction.REMOVE_EMPLOYEES_FROM_PUBLICATION: return t('notificationRemoveEmployees');
        case NotificationAction.RETURN_TO_PUBLICATION: return t('notificationRestoreMe');
        default: return t('viewDetailsLabel');
    }
}
</script>

<style scoped>
.notification-panel {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    border-color: rgba(var(--v-theme-on-surface), 0.12);
    background: rgb(var(--v-theme-surface));
}
.notification-panel--compact { width: min(460px, calc(100vw - 24px)); }
.notification-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px 12px; }
.notification-heading { display: flex; align-items: center; gap: 10px; min-width: 0; }
.notification-heading h2 { font-size: 1.05rem; font-weight: 650; margin: 0; }
.notification-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px; padding: 0 16px; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1); }
.notification-toolbar :deep(.v-tab) { text-transform: none; letter-spacing: 0; min-width: 88px; }
.notification-count { margin-left: 8px; padding: 1px 7px; border-radius: 20px; font-size: 0.72rem; background: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); }
.notification-content { max-height: min(680px, 72vh); overflow-y: auto; overscroll-behavior: contain; }
.notification-panel--compact .notification-content { max-height: min(460px, 60vh); }
.notification-list { padding: 0; margin: 0; list-style: none; }
.notification-row { display: flex; gap: 14px; padding: 20px 24px; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08); }
.notification-row:last-child { border-bottom: 0; }
.notification-row--unread { background: rgba(var(--v-theme-primary), 0.025); }
.notification-symbol { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px; background: rgba(var(--v-theme-primary), 0.09); color: rgb(var(--v-theme-primary)); }
.notification-symbol--read { background: rgba(var(--v-theme-on-surface), 0.05); color: rgba(var(--v-theme-on-surface), 0.5); }
.notification-body { flex: 1; min-width: 0; }
.notification-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px; color: rgba(var(--v-theme-on-surface), 0.55); font-size: 0.75rem; }
.notification-dot { width: 6px; height: 6px; border-radius: 50%; background: rgb(var(--v-theme-primary)); flex-shrink: 0; }
.notification-text { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; overflow-wrap: anywhere; white-space: pre-line; font-size: 0.9rem; line-height: 1.6; margin: 0; }
.notification-message-button { margin: 2px 0 6px -8px; color: rgba(var(--v-theme-on-surface), 0.65); }
.notification-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.notification-action { max-width: 100%; height: auto; min-height: 32px; padding-top: 6px; padding-bottom: 6px; }
.notification-action :deep(.v-btn__content) { white-space: normal; overflow-wrap: anywhere; text-align: left; }
.notification-panel :deep(.v-btn) { text-transform: none; letter-spacing: 0; }
.notification-read-time { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: rgba(var(--v-theme-on-surface), 0.5); margin: 0; }
.notification-empty { padding: 44px 24px; text-align: center; }
.notification-empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: rgba(var(--v-theme-primary), 0.07); color: rgb(var(--v-theme-primary)); margin-bottom: 16px; }
.notification-empty h3 { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
.notification-empty p { font-size: 0.85rem; color: rgba(var(--v-theme-on-surface), 0.6); max-width: 320px; margin: 0 auto; }
.notification-dialog-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; white-space: normal; }
.notification-full-message { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 60vh; overflow-y: auto; line-height: 1.7; }
.notification-confirmation { display: contents; }
@media (max-width: 480px) {
    .notification-header { padding: 16px; }
    .notification-row { padding: 16px; gap: 10px; }
    .notification-mark-all { margin: 0 0 8px auto; }
    .notification-symbol { width: 32px; height: 32px; border-radius: 10px; }
}
</style>
