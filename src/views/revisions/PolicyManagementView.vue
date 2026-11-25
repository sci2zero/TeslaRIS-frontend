<template>
    <v-container>
        <v-card class="assessment-context-bar mb-5" variant="flat">
            <v-card-text class="d-flex flex-wrap align-center">
                <div class="context-block mr-8">
                    <div class="context-label">
                        {{ $t("assessmentContextLabel") }}
                    </div>
                    <div class="context-value">
                        {{ $t("policyManagementLabel") }}
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <div class="text-medium-emphasis mb-4 text-caption">
            {{ $t("policyManagementExplanationMessage") }}
        </div>

        <tab-content-loader v-if="loading" :button-header="false" layout="table" />

        <template v-else>
            <v-alert
                v-if="policies.length === 0"
                type="info"
                variant="tonal"
                class="mb-4">
                {{ $t("noPoliciesMessage") }}
            </v-alert>

            <v-row>
                <v-col
                    v-for="policy in policies"
                    :key="policy.profileName"
                    cols="12"
                    md="6">
                    <v-card variant="flat" rounded="lg" class="policy-card">
                        <v-card-item>
                            <template #prepend>
                                <v-avatar
                                    color="primary"
                                    variant="tonal"
                                    icon="mdi-file-document-outline"
                                />
                            </template>
                            <v-card-title>
                                {{ policyTitle(policy) }}
                            </v-card-title>
                            <v-card-subtitle>
                                {{ policy.profileName }}
                            </v-card-subtitle>
                        </v-card-item>

                        <v-divider />

                        <v-card-text>
                            <div class="text-caption text-medium-emphasis mb-2">
                                {{ $t("policyVersionsLabel") }}
                            </div>

                            <v-list density="compact" class="py-0">
                                <v-list-item
                                    v-for="version in [...policy.versions].reverse()"
                                    :key="version"
                                    class="px-0">
                                    <template #prepend>
                                        <v-icon
                                            size="small"
                                            icon="mdi-code-json"
                                            class="mr-3"
                                        />
                                    </template>

                                    <v-list-item-title>
                                        {{ version }}
                                        <v-chip
                                            v-if="version === policy.latestVersion"
                                            size="x-small"
                                            color="primary"
                                            variant="tonal"
                                            class="ml-2">
                                            {{ $t("currentVersionLabel") }}
                                        </v-chip>
                                    </v-list-item-title>

                                    <template #append>
                                        <v-btn
                                            variant="text"
                                            density="comfortable"
                                            icon="mdi-download-outline"
                                            :title="$t('downloadLabel')"
                                            @click="download(policy.profileName, version)"
                                        />
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi-upload-outline"
                                @click="openUpload(policy)">
                                {{ $t("uploadPolicyLabel") }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <v-dialog v-model="uploadDialog" max-width="640" persistent>
            <v-card>
                <v-card-title>
                    {{ $t("uploadPolicyLabel") }}
                </v-card-title>

                <v-card-text>
                    <div class="text-medium-emphasis mb-4 text-caption">
                        {{ $t("uploadPolicyExplanationMessage") }}
                    </div>

                    <v-file-input
                        v-model="selectedFile"
                        accept="application/json,.json"
                        prepend-icon="mdi-code-json"
                        :label="$t('policyFileLabel')"
                        density="compact"
                        show-size
                        clearable
                    />

                    <v-radio-group v-model="uploadMode" density="compact" hide-details>
                        <v-radio
                            :label="$t('createNewPolicyVersionLabel')"
                            :value="PolicyUploadMode.NEW_VERSION"
                        />
                        <v-radio
                            :label="$t('overwriteCurrentPolicyVersionLabel')"
                            :value="PolicyUploadMode.OVERWRITE_CURRENT"
                        />
                    </v-radio-group>

                    <v-alert
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mt-4">
                        {{ $t("policyTargetVersionMessage", [targetVersion]) }}
                    </v-alert>

                    <v-alert
                        v-if="uploadMode === PolicyUploadMode.OVERWRITE_CURRENT"
                        type="warning"
                        variant="tonal"
                        density="compact"
                        class="mt-2">
                        {{ $t("overwritePolicyWarningMessage") }}
                    </v-alert>

                    <v-alert
                        v-if="violations.length > 0"
                        type="error"
                        variant="tonal"
                        density="compact"
                        class="mt-4">
                        <div class="font-weight-medium mb-1">
                            {{ $t("policyValidationFailedMessage") }}
                        </div>
                        <ul class="violation-list">
                            <li v-for="violation in violations" :key="violation.field">
                                <strong>{{ violation.field }}</strong>:
                                {{ violation.message }}
                            </li>
                        </ul>
                    </v-alert>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" :disabled="uploading" @click="closeUpload">
                        {{ $t("cancelLabel") }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="flat"
                        :disabled="!pickedFile"
                        :loading="uploading"
                        @click="submit">
                        {{ $t("uploadLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="overwriteDialog" max-width="520">
            <v-card>
                <v-card-title>{{ $t("overwriteCurrentPolicyVersionLabel") }}</v-card-title>
                <v-card-text>
                    {{ $t("overwritePolicyConfirmationMessage",
                          [policyPendingUpload?.profileName, targetVersion]) }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="overwriteDialog = false">
                        {{ $t("cancelLabel") }}
                    </v-btn>
                    <v-btn color="error" variant="flat" @click="upload">
                        {{ $t("overwriteLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="resultDialog" max-width="640">
            <v-card>
                <v-card-title>{{ $t("uploadPolicyLabel") }}</v-card-title>
                <v-card-text>
                    <v-alert type="success" variant="tonal" density="compact">
                        {{ result?.versionCreated
                            ? $t("policyVersionCreatedMessage", [result?.version])
                            : $t("policyVersionOverwrittenMessage", [result?.version]) }}
                    </v-alert>

                    <v-alert
                        type="warning"
                        variant="tonal"
                        density="compact"
                        class="mt-3">
                        {{ $t("policyBackfillRequiredMessage") }}
                    </v-alert>

                    <v-alert
                        v-if="(result?.warnings?.length ?? 0) > 0"
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mt-3">
                        <div class="font-weight-medium mb-1">
                            {{ $t("policyWarningsLabel") }}
                        </div>
                        <ul class="violation-list">
                            <li v-for="warning in result?.warnings" :key="warning">
                                {{ warning }}
                            </li>
                        </ul>
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" :to="{ name: 'scheduledTasks' }">
                        {{ $t("scheduleBackfillLabel") }}
                    </v-btn>
                    <v-btn color="primary" variant="flat" @click="resultDialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import Toast from "@/components/core/Toast.vue";
import DataQualityPolicyService from "@/services/revision/DataQualityPolicyService";
import { useDataQualityProfiles } from "@/composables/useDataQualityProfiles";
import { PolicyUploadMode, type PolicyFileSummary, type PolicyUploadResult } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getErrorMessageForErrorKey } from "@/i18n";
import type { AxiosError } from "axios";


const i18n = useI18n();
const { fetchProfiles } = useDataQualityProfiles();

const loading = ref(false);
const snackbar = ref(false);
const message = ref("");

const policies = ref<PolicyFileSummary[]>([]);

const uploadDialog = ref(false);
const overwriteDialog = ref(false);
const resultDialog = ref(false);
const uploading = ref(false);

const policyPendingUpload = ref<PolicyFileSummary | null>(null);
// The file input hands over either one file or a one-element list, depending on the Vuetify
// build, thus the picked file is normalised in one place.
const selectedFile = ref<File | File[] | null>(null);

const pickedFile = computed<File | null>(() => Array.isArray(selectedFile.value)
    ? (selectedFile.value[0] ?? null)
    : selectedFile.value);
const uploadMode = ref<PolicyUploadMode>(PolicyUploadMode.NEW_VERSION);
const violations = ref<{ field: string, message: string }[]>([]);
const result = ref<PolicyUploadResult | null>(null);

const policyTitle = (policy: PolicyFileSummary) =>
    returnCurrentLocaleContent(policy.name) ?? policy.profileName;

// Mirrors the server's bump so the dialog can name the version before the upload is sent. The
// response carries the version that was actually written.
const nextVersion = (policy: PolicyFileSummary): string => {
    const latest = policy.latestVersion ?? "";
    const separatorIndex = latest.lastIndexOf(".");
    const prefix = separatorIndex === -1 ? "" : latest.substring(0, separatorIndex + 1);
    const lastSegment = latest.substring(separatorIndex + 1);

    if (!/^\d+$/.test(lastSegment)) {
        return "?";
    }

    let next = parseInt(lastSegment, 10);
    let candidate;

    do {
        next++;
        candidate = `${prefix}${next}`;
    } while (policy.versions.includes(candidate));

    return candidate;
};

const targetVersion = computed(() => {
    const policy = policyPendingUpload.value;

    if (!policy) {
        return "";
    }

    return uploadMode.value === PolicyUploadMode.OVERWRITE_CURRENT
        ? policy.latestVersion
        : nextVersion(policy);
});

const notify = (text: string) => {
    message.value = text;
    snackbar.value = true;
};

const notifyFailure = (error: AxiosError<{ message?: string }>) => {
    notify(getErrorMessageForErrorKey(error.response?.data?.message as string));
};

const fetchPolicies = () => {
    loading.value = true;

    DataQualityPolicyService.listPolicies().then(response => {
        policies.value = response.data;
    }).catch(error => {
        policies.value = [];
        notifyFailure(error);
    }).finally(() => {
        loading.value = false;
    });
};

const download = (profileName: string, version: string) => {
    DataQualityPolicyService.downloadPolicyVersion(profileName, version)
        .catch(error => notifyFailure(error));
};

const openUpload = (policy: PolicyFileSummary) => {
    policyPendingUpload.value = policy;
    selectedFile.value = null;
    uploadMode.value = PolicyUploadMode.NEW_VERSION;
    violations.value = [];
    uploadDialog.value = true;
};

const closeUpload = () => {
    uploadDialog.value = false;
    policyPendingUpload.value = null;
    selectedFile.value = null;
    violations.value = [];
};

const submit = () => {
    if (uploadMode.value === PolicyUploadMode.OVERWRITE_CURRENT) {
        overwriteDialog.value = true;
        return;
    }

    upload();
};

const upload = () => {
    const policy = policyPendingUpload.value;
    const file = pickedFile.value;

    if (!policy || !file) {
        return;
    }

    overwriteDialog.value = false;
    uploading.value = true;
    violations.value = [];

    DataQualityPolicyService.uploadPolicy(policy.profileName, uploadMode.value, file)
        .then(response => {
            result.value = response.data;
            uploadDialog.value = false;
            resultDialog.value = true;

            // The profile listing is cached for the session, thus a new version stays invisible in
            // every picker until the cache is dropped.
            fetchProfiles();
            fetchPolicies();
        }).catch((error: AxiosError<{ message?: string, errors?: Record<string, string> }>) => {
            const reported = error.response?.data?.errors ?? {};

            violations.value = Object.entries(reported).map(([field, messageKey]) => ({
                field,
                message: getErrorMessageForErrorKey(messageKey)
            }));

            if (violations.value.length === 0) {
                notifyFailure(error);
            }
        }).finally(() => {
            uploading.value = false;
        });
};

onMounted(() => {
    document.title = i18n.t("routeLabel.policyManagement");
    fetchPolicies();
});
</script>

<style scoped>
.assessment-context-bar {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.context-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
}

.context-value {
    font-size: 0.95rem;
    font-weight: 600;
}

/* A v-card clips its own overflow, thus the card gets no height and the actions stay visible. */
.policy-card {
    border: 1px solid rgba(var(--v-border-color), 0.12);
    overflow: visible;
}

.violation-list {
    margin: 0;
    padding-left: 1.2rem;
}
</style>
