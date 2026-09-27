<template>
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <button
            type="button"
            class="flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg"
            :class="fileVisual.tileClass"
            :aria-label="$t('downloadLabel')"
            @click="download">
            <span class="mdi text-2xl leading-none" :class="fileVisual.icon" aria-hidden="true"></span>
            <span class="text-[10px] font-bold uppercase leading-none tracking-wide">
                {{ fileVisual.extension }}
            </span>
        </button>

        <div class="min-w-0 flex-1">
            <button
                type="button"
                class="block max-w-full bg-transparent p-0 text-left text-sm font-semibold break-words text-slate-800 hover:underline"
                @click="download">
                {{ attachment.fileName }}
            </button>
            <p class="mt-0.5 text-xs text-slate-500">
                <span v-if="resourceTypeTitle">{{ resourceTypeTitle }}</span>
                <span v-if="resourceTypeTitle"> · </span>
                <span>{{ sizeLabel }}</span>
            </p>
            <p
                v-if="description"
                class="mt-0.5 text-sm text-slate-500">
                {{ description }}
            </p>
            <v-chip
                v-if="attachment.isArchived"
                class="mt-1.5"
                size="x-small"
                variant="tonal">
                {{ $t("archivedDocumentFileLabel") }}
            </v-chip>
        </div>

        <c-c-license-badge
            v-if="showLicense"
            :license="attachment.license.toLowerCase()"
        />

        <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
                <v-btn
                    v-bind="menuProps"
                    icon
                    variant="text"
                    size="small"
                    class="shrink-0 text-slate-500"
                    :aria-label="$t('moreActionsLabel')">
                    <v-icon icon="mdi-dots-horizontal"></v-icon>
                </v-btn>
            </template>
            <v-list class="min-w-48 rounded-lg border border-slate-200 py-1" density="compact">
                <v-list-item
                    prepend-icon="mdi-download"
                    :title="$t('downloadLabel')"
                    @click="download"
                />
                <v-list-item
                    v-if="showEdit"
                    prepend-icon="mdi-pencil-outline"
                    :title="$t('editActionLabel')"
                    @click="openEdit"
                />
                <v-list-item
                    v-if="showDelete"
                    prepend-icon="mdi-delete-outline"
                    :title="$t('deleteLabel')"
                    @click="emit('delete')"
                />
                <v-list-item
                    v-if="showMakeOfficial"
                    prepend-icon="mdi-file-move-outline"
                    :title="$t('makeOfficialLabel')"
                    @click="emit('make-official')"
                />
            </v-list>
        </v-menu>

        <document-file-submission-modal
            v-if="showEdit"
            ref="editModalRef"
            edit
            hide-activator
            :is-proof="isProof"
            :preset-document-file="attachment"
            :allow-licence-selection="allowLicenceSelection"
            :disable-resource-type-selection="disableResourceTypeSelection"
            :allowed-resource-types="allowedResourceTypes"
            :can-be-archived="canBeArchived"
            @update="emit('update', $event)"
        />

        <toast v-model="snackbar" :message="errorMessage" />
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import CCLicenseBadge from "@/components/core/CCLicenseBadge.vue";
import Toast from "@/components/core/Toast.vue";
import DocumentFileSubmissionModal from "@/components/documentFile/DocumentFileSubmissionModal.vue";
import { useUserRole } from "@/composables/useUserRole";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getResourceTypeTitleFromValueAutoLocale } from "@/i18n/resourceType";
import type { DocumentFile, DocumentFileResponse, ResourceType } from "@/models/DocumentFileModel";
import DocumentFileService from "@/services/DocumentFileService";

const props = defineProps<{
    attachment: DocumentFileResponse;
    canEdit?: boolean;
    isProof?: boolean;
    allowLicenceSelection?: boolean;
    disableUpdates?: boolean;
    disableResourceTypeSelection?: boolean;
    allowedResourceTypes?: ResourceType[];
    canMakeOfficial?: boolean;
    canBeArchived?: boolean;
}>();

const emit = defineEmits<{
    delete: [];
    update: [documentFile: DocumentFile];
    "make-official": [];
}>();

defineOptions({
    name: "AttachmentElement",
});

const i18n = useI18n();
const { isAdmin, isHeadOfLibrary, isInstitutionalLibrarian } = useUserRole();

const errorMessage = ref("");
const snackbar = ref(false);
const editModalRef = ref<{ openDialog: () => void } | null>(null);

const fileVisual = computed(() => fileTypeVisual(props.attachment.fileName || props.attachment.serverFilename));

const resourceTypeTitle = computed(() =>
    getResourceTypeTitleFromValueAutoLocale(props.attachment.resourceType) || ""
);

const description = computed(() => returnCurrentLocaleContent(props.attachment.description) || "");

const sizeLabel = computed(() =>
    `${props.attachment.sizeInMb > 0 ? props.attachment.sizeInMb : "<1"} MB`
);

const showLicense = computed(() =>
    props.attachment.accessRights?.toString() === "OPEN_ACCESS" && !!props.attachment.license
);

const showDelete = computed(() =>
    !!props.canEdit && (
        !props.disableUpdates ||
        isInstitutionalLibrarian.value ||
        isAdmin.value ||
        isHeadOfLibrary.value
    )
);

const showEdit = computed(() => !!props.canEdit && !props.disableUpdates);

const showMakeOfficial = computed(() =>
    !!props.canMakeOfficial && !!props.canEdit && (isAdmin.value || isInstitutionalLibrarian.value)
);

const download = () => {
    DocumentFileService.downloadDocumentFile(
        props.attachment.serverFilename,
        props.attachment.fileName,
        props.attachment.serverFilename.split(".").pop() as string,
        false
    ).catch((error) => {
        if (error.response?.status === 451) {
            errorMessage.value = i18n.t("loginToViewDocumentMessage");
        } else {
            errorMessage.value = i18n.t("genericErrorMessage");
        }
        snackbar.value = true;
    });
};

const openEdit = () => {
    nextTick(() => {
        editModalRef.value?.openDialog();
    });
};

interface FileTypeVisual {
    icon: string;
    tileClass: string;
    extension: string;
}

const fileTypeVisual = (fileName: string): FileTypeVisual => {
    const rawExtension = fileName.includes(".")
        ? (fileName.split(".").pop() || "").toLowerCase()
        : "";
    const extension = (rawExtension || "file").toUpperCase().slice(0, 4);

    const images = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "tif", "tiff", "heic", "avif"];
    const documents = ["doc", "docx", "odt", "rtf"];
    const sheets = ["xls", "xlsx", "ods", "csv"];
    const slides = ["ppt", "pptx", "odp"];
    const archives = ["zip", "rar", "7z", "tar", "gz"];

    if (rawExtension === "pdf") {
        return { icon: "mdi-file-pdf-box", tileClass: "bg-red-50 text-red-600", extension: "PDF" };
    }
    if (images.includes(rawExtension)) {
        return { icon: "mdi-file-image-outline", tileClass: "bg-violet-50 text-violet-600", extension };
    }
    if (documents.includes(rawExtension)) {
        return { icon: "mdi-file-word-outline", tileClass: "bg-blue-50 text-blue-700", extension };
    }
    if (sheets.includes(rawExtension)) {
        return { icon: "mdi-file-excel-outline", tileClass: "bg-emerald-50 text-emerald-700", extension };
    }
    if (slides.includes(rawExtension)) {
        return { icon: "mdi-file-powerpoint-outline", tileClass: "bg-orange-50 text-orange-700", extension };
    }
    if (archives.includes(rawExtension)) {
        return { icon: "mdi-folder-zip-outline", tileClass: "bg-amber-50 text-amber-700", extension };
    }

    return { icon: "mdi-file-outline", tileClass: "bg-slate-100 text-slate-600", extension };
};
</script>
