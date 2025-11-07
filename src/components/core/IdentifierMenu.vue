<template>
    <div v-if="identifier">
        <v-menu
            open-on-hover open-on-click location="top" :open-delay="100"
            :close-on-content-click="false">
            <template #activator="{ props }">
                <span v-bind="props" class="inline-flex items-center cursor-pointer select-none transition-all duration-200 ease-in-out hover:opacity-80 hover:scale-105">
                    <span v-if="type === 'orcid'">
                        <img src="/icons/orcid.svg" alt="ORCID" class="pointer-events-none size-6" />
                    </span>
                    <span v-else-if="type === 'scopus'" class="size-6 rounded-full bg-[#ff8400] p-[2px]">
                        <img src="/icons/scopus-icon.png" alt="SCOPUS" class="pointer-events-none rounded-full" />
                    </span>
                    <span v-else-if="type === 'openalex'" class="size-6 p-0.5">
                        <img src="/icons/openalex-logo.png" alt="SCOPUS" class="pointer-events-none" />
                    </span>
                    <span v-else-if="type === 'webofscience'" class="size-6 p-0.5">
                        <img src="/icons/wos-logo.svg" alt="SCOPUS" class="pointer-events-none" />
                    </span>
                    <span v-else-if="type === 'doi'" class="size-6 p-0.5">
                        <img src="/icons/doi.svg" alt="DOI" class="pointer-events-none" />
                    </span>
                    <span v-else>
                        <v-icon class="pointer-events-none size-6" color="#666">mdi-identifier</v-icon>
                    </span>
                </span>
            </template>
            <v-card class="min-w-[280px] max-w-[320px] !rounded-xl !shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/10 bg-gradient-to-br from-white to-gray-50" elevation="8">
                <div class="!text-white font-semibold text-[0.9rem]! px-4 py-3 rounded-t-xl flex items-center gap-2" :style="{ background: titleBackground }">
                    <v-icon class="!text-white text-[1.1rem]" :color="titleIconColor">
                        mdi-account-circle
                    </v-icon>
                    {{ titleText }}
                </div>
                <div class="!px-5 !py-4 bg-white rounded-b-xl">
                    <div class="flex flex-col gap-2">
                        <!-- <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">{{ labelText }}:</span> -->
                        <div class="flex items-center gap-2 py-1">
                            <div class="flex-1">
                                <a 
                                    :href="profileUrl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-base break-all leading-6 no-underline text-blue-700 transition-all duration-200 ease-in-out font-medium inline-flex items-center gap-1 hover:underline hover:text-blue-800">
                                    {{ identifier }}
                                    <v-icon size="x-small">mdi-open-in-new</v-icon>
                                </a>
                            </div>
                            <v-btn
                                icon
                                size="x-medium"
                                variant="text"
                                class="opacity-70 hover:opacity-100 transition-opacity duration-200 !min-w-0 !p-0"
                                color="gray"
                                @click="copyIdentifier">
                                <v-icon size="small">
                                    mdi-content-copy
                                </v-icon>
                            </v-btn>
                        </div>
                    </div>
                </div>
                <!-- <v-card-actions class="!px-4 !pb-4 !pt-2 bg-gray-50 rounded-b-xl gap-2 justify-between">
                    <v-btn
                        variant="text"
                        size="small"
                        prepend-icon="mdi-content-copy"
                        @click="copyIdentifier"
                        class="font-medium text-xs normal-case min-w-0 !px-3 !py-1.5 hover:opacity-80"
                        :style="{ color: primaryColor }">
                        Copy ID
                    </v-btn>
                    <v-btn
                        variant="text"
                        size="small"
                        prepend-icon="mdi-open-in-new"
                        :href="profileUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="!text-blue-700 font-medium text-xs normal-case min-w-0 !px-3 !py-1.5 hover:!bg-blue-700/10">
                        View Profile
                    </v-btn>
                </v-card-actions> -->
            </v-card>
        </v-menu>
        
        <div class="fixed top-5 right-5 z-[9999] max-w-[300px]">
            <v-slide-y-transition group>
                <v-alert
                    v-for="notification in notifications"
                    :key="notification[0]"
                    theme="dark"
                    class="mb-2 rounded-lg text-[0.85rem]"
                >
                    {{ notification[1] }}
                </v-alert>
            </v-slide-y-transition>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: 'IdentifierMenu',
    props: {
        identifier: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            validator: (value: string) => ['orcid', 'scopus', 'openalex', 'webofscience', 'doi'].includes(value)
        }
    },
    setup(props) {
        const i18n = useI18n();
        const notifications = ref<Map<string, string>>(new Map());

        const identifierConfig = computed(() => {
            switch (props.type) {
                case 'orcid':
                    return {
                        title: 'ORCID Profile',
                        label: 'ORCID ID',
                        baseUrl: 'https://orcid.org/',
                        primaryColor: '#A6CE39',
                        titleBackground: 'linear-gradient(135deg, #A6CE39 0%, #8BC34A 100%)',
                        titleIconColor: 'white'
                    };
                case 'scopus':
                    return {
                        title: 'Scopus Profile',
                        label: 'Scopus Author ID',
                        baseUrl: 'https://www.scopus.com/authid/detail.uri?authorId=',
                        primaryColor: '#E9711C',
                        titleBackground: 'linear-gradient(135deg, #E9711C 0%, #FF8A65 100%)',
                        titleIconColor: 'white'
                    };
                case 'openalex':
                    return {
                        title: 'OpenAlex Profile',
                        label: 'OpenAlex ID',
                        baseUrl: 'https://openalex.org/',
                        primaryColor: '#1976d2',
                        titleBackground: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        titleIconColor: 'white'
                    };
                case 'webofscience':
                    return {
                        title: 'Web of Science Profile',
                        label: 'WOS Researcher ID',
                        baseUrl: 'https://www.webofscience.com/api/gateway?GWVersion=2&SrcApp=teslaris&SrcAuth=WosAPI&DestLinkType=FullRecord&DestApp=WOS_CPL&KeyUT=WOS:',
                        primaryColor: '#0066CC',
                        titleBackground: 'linear-gradient(135deg, #0066CC 0%, #2196f3 100%)',
                        titleIconColor: 'white'
                    };
                case 'doi':
                    return {
                        title: 'DOI',
                        label: 'Digital Object Identifier',
                        baseUrl: 'https://doi.org/',
                        primaryColor: '#FDB714',
                        titleBackground: 'linear-gradient(135deg, #FDB714 0%, #FDC84D 100%)',
                        titleIconColor: 'white'
                    };
                default:
                    return {
                        title: 'Profile',
                        label: 'ID',
                        baseUrl: '',
                        primaryColor: '#666',
                        titleBackground: 'linear-gradient(135deg, #666 0%, #999 100%)',
                        titleIconColor: 'white'
                    };
            }
        });

        const titleText = computed(() => identifierConfig.value.title);
        const labelText = computed(() => identifierConfig.value.label);
        const primaryColor = computed(() => identifierConfig.value.primaryColor);
        const titleBackground = computed(() => identifierConfig.value.titleBackground);
        const titleIconColor = computed(() => identifierConfig.value.titleIconColor);
        const profileUrl = computed(() => `${identifierConfig.value.baseUrl}${props.identifier}`);

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();
            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const copyIdentifier = async () => {
            try {
                await navigator.clipboard.writeText(props.identifier);
                addNotification(i18n.t("identifierCopiedNotification", { identifier: props.identifier }));
            } catch {
                const textArea = document.createElement('textarea');
                textArea.value = props.identifier;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                addNotification(i18n.t("identifierCopiedNotification", { identifier: props.identifier }));
            }
        };

        return { 
            copyIdentifier, 
            notifications, 
            removeNotification,
            titleText,
            labelText,
            primaryColor,
            titleBackground,
            titleIconColor,
            profileUrl
        };
    }
});
</script>

