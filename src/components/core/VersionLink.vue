<template>
    <div>
        <span>{{ currentYear }} — </span>
        <v-menu :close-on-content-click="false" location="top" offset-y>
            <template #activator="{ props }">
                <strong class="cursor-pointer" v-bind="props">
                    TeslaRIS {{ frontendVersion }}
                </strong>
            </template>

            <v-card min-width="300">
                <v-list>
                    <v-list-item>
                        <v-list-item-title>Frontend Version:</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-badge v-if="frontendVersion" color="info" :content="frontendVersion" inline />
                            <a v-if="frontendGitTag" :href="frontendGithubBranch" target="_blank">
                                <v-badge color="red" :content="frontendGitTag" inline />
                            </a>
                            <a v-if="frontendGitCommitHash" :href="frontendGithubCommit" target="_blank">
                                <v-badge color="red" :content="frontendGitCommitHash" inline />
                            </a>
                        </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="backendData.appVersion">
                        <v-list-item-title>Backend Version:</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-badge color="info" :content="backendData.appVersion" inline />
                            <a v-if="backendData.appGitTag" :href="backendGithubBranch" target="_blank">
                                <v-badge color="red" :content="backendData.appGitTagShort" inline />
                            </a>
                            <a v-if="backendData.appGitCommitHash" :href="backendGithubCommit" target="_blank">
                                <v-badge color="red" :content="backendData.appGitCommitHashShort" inline />
                            </a>
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import HealthCheckService from '@/services/HealthCheckService'
import type { AxiosResponse } from 'axios'

// Static data
const currentYear = new Date().getFullYear()

// Frontend environment
const envVersion = import.meta.env.VITE_APP_VERSION?.replace(/^v(\d)/, '$1')
const packageVersion = import.meta.env.VITE_APP_VERSION_PACKAGE
const buildSha = import.meta.env.VITE_FRONTEND_GIT_COMMIT_HASH || ''
const buildRef = import.meta.env.VITE_FRONTEND_GIT_TAG || ''
const githubRepoUrl = import.meta.env.VITE_FRONTEND_GITHUB_REPO || ''

// Frontend computed refs
const frontendVersion = ref(envVersion || packageVersion)
const frontendGitTag = ref(buildRef.replace('refs/heads/', '').replace(/^v(\d)/, '$1')) // Remove 'refs/heads/' and 'v' prefix (v1.0.0) 
const frontendGitCommitHash = ref(buildSha.substring(0, 7))
const frontendGithubBranch = computed(() => `${githubRepoUrl}/tree/${buildRef}`)
const frontendGithubCommit = computed(() => `${githubRepoUrl}/commit/${buildSha}`)

// Backend data
const backendData = reactive({
    appVersion: '',
    appGitCommitHash: '',
    appGitCommitHashShort: '',
    appGitTag: '',
    appGitTagShort: '',
    appGitRepoUrl: '',
})

// Backend computed links
const backendGithubBranch = computed(() =>
    `${backendData.appGitRepoUrl}/tree/${backendData.appGitTag}`
)
const backendGithubCommit = computed(() =>
    `${backendData.appGitRepoUrl}/commit/${backendData.appGitCommitHash}`
)

// Fetch backend health
const loading = ref(false)

const fetchHealthStatus = async () => {
    try {
        const { data }: AxiosResponse<any> = await HealthCheckService.getHealthCheckVersion()
        backendData.appVersion = data.appVersion?.replace(/^v(\d)/, '$1') || ''
        backendData.appGitCommitHash = data.appGitCommitHash || ''
        backendData.appGitCommitHashShort = backendData.appGitCommitHash.substring(0, 7)
        backendData.appGitTag = data.appGitTag || ''
        backendData.appGitTagShort = backendData.appGitTag.replace('refs/heads/', '').replace(/^v(\d)/, '$1')
        backendData.appGitRepoUrl = data.appGitRepoUrl || ''
    } catch (error) {
        console.error('Failed to fetch backend version info', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loading.value = true
    fetchHealthStatus()
})

</script>