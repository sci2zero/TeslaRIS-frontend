<template>
    <div v-if="identifier">
        <v-menu open-on-hover location="top" :open-delay="0" :close-on-content-click="false">
            <template #activator="{ props }">
                <span v-bind="props" class="identifier-icon-link">
                    <span v-if="type === 'orcid'">
                        <img src="/icons/orcid.svg" alt="ORCID" class="identifier-icon size-6" />
                    </span>
                    <span v-else-if="type === 'scopus'" class="size-6 rounded-full bg-[#ff8400] p-[2px]">
                        <img src="/icons/scopus-icon.png" alt="SCOPUS" class="identifier-icon rounded-full" />
                    </span>
                    <span v-else-if="type === 'openalex'" class="size-6 p-0.5">
                        <img src="/icons/openalex-logo.png" alt="SCOPUS" class="identifier-icon" />
                    </span>
                    <span v-else-if="type === 'webofscience'" class="size-6 p-0.5">
                        <img src="/icons/wos-logo.svg" alt="SCOPUS" class="identifier-icon" />
                    </span>
                    <span v-else-if="type === 'doi'" class="size-6 p-0.5">
                        <img src="/icons/doi.svg" alt="DOI" class="identifier-icon" />
                    </span>
                    <span v-else>
                        <v-icon class="identifier-icon size-6" color="#666">mdi-identifier</v-icon>
                    </span>
                </span>
            </template>
            <v-card class="identifier-menu-card" elevation="8">
                <v-card-title class="identifier-menu-title" :style="{ background: titleBackground }">
                    <v-icon class="identifier-menu-icon" :color="titleIconColor">mdi-account-circle</v-icon>
                    {{ titleText }}
                </v-card-title>
                <v-card-text class="identifier-menu-content">
                    <div class="identifier-id-display">
                        <span class="identifier-label">{{ labelText }}:</span>
                        <code class="identifier-code">{{ identifier }}</code>
                    </div>
                </v-card-text>
                <v-card-actions class="identifier-menu-actions">
                    <v-btn
                        variant="text"
                        size="small"
                        prepend-icon="mdi-content-copy"
                        @click="copyIdentifier"
                        class="identifier-copy-btn"
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
                        class="identifier-view-btn">
                        View Profile
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
        
        <div class="notificationContainer">
            <v-slide-y-transition group>
                <v-alert
                    v-for="notification in notifications"
                    :key="notification[0]"
                    theme="dark"
                    class="identifier-notification"
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
            } catch (err) {
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

<style scoped>
    .identifier-icon-link {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        transition: all 0.2s ease;
    }

    .identifier-icon-link:hover {
        opacity: 0.8;
        transform: scale(1.05);
    }

    .identifier-icon {
        pointer-events: none;
    }

    .identifier-menu-card {
        min-width: 280px;
        max-width: 320px;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    }

    .identifier-menu-title {
        color: white !important;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 12px 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .identifier-menu-icon {
        color: white !important;
        font-size: 1.1rem;
    }

    .identifier-menu-content {
        padding: 16px !important;
        background: white;
    }

    .identifier-id-display {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .identifier-label {
        font-size: 0.8rem;
        font-weight: 500;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .identifier-code {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.85rem;
        background: #f5f5f5;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        color: #333;
        word-break: break-all;
        line-height: 1.4;
    }

    .identifier-menu-actions {
        padding: 8px 16px 16px 16px !important;
        background: #fafafa;
        border-radius: 0 0 12px 12px;
        gap: 8px;
        justify-content: space-between;
    }

    .identifier-copy-btn {
        font-weight: 500;
        font-size: 0.8rem;
        text-transform: none;
        min-width: auto;
        padding: 6px 12px !important;
    }

    .identifier-copy-btn:hover {
        opacity: 0.8;
    }

    .identifier-view-btn {
        color: #1976d2 !important;
        font-weight: 500;
        font-size: 0.8rem;
        text-transform: none;
        min-width: auto;
        padding: 6px 12px !important;
    }

    .identifier-view-btn:hover {
        background-color: rgba(25, 118, 210, 0.1) !important;
    }

    .notificationContainer {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
    }

    .identifier-notification {
        margin-bottom: 8px;
        border-radius: 8px;
        font-size: 0.85rem;
    }
</style>
