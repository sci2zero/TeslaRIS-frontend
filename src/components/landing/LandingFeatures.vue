<template>
    <div class="bg-gray-100 rounded-[20px] p-4 md:p-6 lg:p-8 shadow-lg border border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:shadow-2xl hover:border-blue-400/30">
        <div class="container mx-auto px-4 py-16">
            <div class="text-center mb-12">
                <h3 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-clip-text">
                    Istraživanja i publikacije
                </h3>
                <p class="text-base md:text-lg text-slate-500 max-w-4xl mx-auto leading-relaxed">
                    Najnoviji naučni rezultati i istraživači Univerziteta u Novom Sadu
                </p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Recent Publications -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-book-open-page-variant" size="32" color="#3b82f6"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            Najnovije publikacije
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-for="(pub, index) in recentPublications" :key="index" class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-blue-500/10">
                                <v-icon :icon="pub.icon" size="20" :color="pub.iconColor"></v-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ pub.title }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ pub.authors }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ pub.year }} • {{ pub.type }}</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="primary" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/publications')"
                    >
                        Pregledaj sve publikacije
                    </v-btn>
                </div>

                <!-- Featured Researchers -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-account-group" size="32" color="#10b981"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            Istraživači
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-for="(researcher, index) in featuredResearchers" :key="index" class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 bg-slate-100">
                                <img 
                                    :src="researcher.avatar ?? 'https://randomuser.me/api/portraits/men/90.jpg'" 
                                    :alt="researcher.name" 
                                    class="w-full h-full object-cover"
                                    @error="handleAvatarError"
                                />
                                <v-icon 
                                    icon="mdi-account-circle" 
                                    size="24" 
                                    color="#94a3b8"
                                    style="display: none;"
                                    class="w-full h-full flex items-center justify-center"
                                ></v-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ researcher.name }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ researcher.position }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ researcher.department }}</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="success" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/persons')"
                    >
                        Pregledaj sve istraživače
                    </v-btn>
                </div>

                <!-- Research Areas -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-flask" size="32" color="#f59e0b"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            Oblast istraživanja
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-for="(area, index) in researchAreas" :key="index" class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0">
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ area.name }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ area.description }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ area.publications }} publikacija</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="warning" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/research-areas')"
                    >
                        Istraži sve oblasti
                    </v-btn>
                </div>
            </div>

            <!-- Additional Info Section -->
            <AdditionalInfoSection />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AdditionalInfoSection from './AdditionalInfoSection.vue';

// Sample data for feature lists
const recentPublications = ref([
    {
        title: "Machine Learning Applications in Bioinformatics",
        authors: "Petrović, M., Jovanović, S., Nikolić, D.",
        year: "2024",
        type: "Journal Article",
        icon: "mdi-book-open-variant",
        iconColor: "#3b82f6"
    },
    {
        title: "Sustainable Energy Solutions for Smart Cities",
        authors: "Kovačević, A., Marković, B., Popović, I.",
        year: "2024",
        type: "Conference Paper",
        icon: "mdi-lightning-bolt",
        iconColor: "#f59e0b"
    },
    {
        title: "Advanced Materials for Biomedical Applications",
        authors: "Stojanović, N., Đorđević, M., Vuković, S.",
        year: "2023",
        type: "Journal Article",
        icon: "mdi-flask",
        iconColor: "#10b981"
    }
]);

const featuredResearchers = ref([
    {
        name: "Dr. Dragan Ivanović",
        position: "Professor",
        department: "Faculty of Technical Sciences",
        avatar: "https://randomuser.me/api/portraits/men/90.jpg?v=1"
    },
    {
        name: "Ivan Mršulja",
        position: "Assistant",
        department: "Faculty of Technical Sciences",
        avatar: "https://randomuser.me/api/portraits/women/90.jpg?v=2"
    },
    {
        name: "Miloš Popović",
        position: "Assistant",
        department: "Faculty of Technical Sciences",
        avatar: "https://randomuser.me/api/portraits/men/90.jpg?v=3"
    }
]);

const researchAreas = ref([
    {
        name: "Artificial Intelligence & Machine Learning",
        description: "Advanced algorithms and neural networks",
        publications: 342
    },
    {
        name: "Biomedical Engineering",
        description: "Medical devices and biotechnology",
        publications: 198
    },
    {
        name: "Sustainable Energy",
        description: "Renewable energy and green technology",
        publications: 156
    }
]);

// Handle avatar image loading errors
const handleAvatarError = (event: Event) => {
    const target = event.target as HTMLImageElement;
    if (target) {
        target.style.display = 'none';
        const iconElement = target.nextElementSibling as HTMLElement;
        if (iconElement) {
            iconElement.style.display = 'flex';
        }
    }
};
</script>

<style>
@reference "@/assets/main.css";

.feature-card {
    @apply bg-white rounded-[20px] p-4 md:p-6 lg:p-8 shadow-lg border border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:shadow-2xl hover:border-blue-400/30;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
}
</style>

