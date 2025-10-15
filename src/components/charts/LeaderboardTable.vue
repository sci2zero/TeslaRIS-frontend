<template>
    <div class="leaderboard-container mt-5">
        <div class="d-block text-center mb-5">
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
        </div>
        <div v-if="leaderboardData.length > 0">
            <v-card
                v-for="(item, index) in leaderboardData.filter(row => row.a != null)"
                :key="(item.a.databaseId as number)"
                class="leaderboard-card mb-4"
                :class="getCardClass(index)"
                @click="navigateToEntityLandingPage((item.a as PersonIndex | OrganisationUnitIndex))"
            >
                <div class="card-content">
                    <div class="trophy-section">
                        <img 
                            v-if="index === 0" 
                            src="@/assets/gold-trophy.png" 
                            alt="Gold Trophy" 
                            class="trophy-icon"
                        />
                        <img 
                            v-else-if="index === 1" 
                            src="@/assets/silver-trophy.png" 
                            alt="Silver Trophy" 
                            class="trophy-icon"
                        />
                        <img 
                            v-else-if="index === 2" 
                            src="@/assets/bronze-trophy.png" 
                            alt="Bronze Trophy" 
                            class="trophy-icon"
                        />
                        <span v-else class="ordinal-number">{{ index + 1 }}</span>
                    </div>
        
                    <div class="info-section">
                        <div class="name">
                            {{ getEntityName((item.a as PersonIndex | OrganisationUnitIndex)) }} {{ displayEmployeeCount ? `(${(item.a as OrganisationUnitIndex).employeeCount})` : "" }}
                        </div>
                        <div class="value">
                            {{ formatValue(item.b) }}
                        </div>
                    </div>
                </div>
            </v-card>
        </div>
        <h5
            v-else
            class="d-flex flex-row justify-center text-center">
            {{ $t("noDataInTableMessage") }}
        </h5>
    </div>
</template>

<script lang="ts" setup>
import { type LeaderboardEntry } from '@/models/Common';
import { type OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import { type PersonIndex } from '@/models/PersonModel';
import { type PropType } from 'vue';
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';


const props = defineProps({
    leaderboardData: {
        type: Array as PropType<LeaderboardEntry[]>,
        required: true
    },
    valueSuffix: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ""
    },
    subtitle: {
        type: String,
        default: ""
    },
    displayEmployeeCount: {
        type: Boolean,
        default: false
    }
});


const i18n = useI18n();
const router = useRouter();

const getCardClass = (position: number) => {
    switch (position) {
        case 0: return 'gold-card'
        case 1: return 'silver-card'
        case 2: return 'bronze-card'
        default: return 'standard-card'
    }
};

const formatValue = (value: number) => {
    const formatted = new Intl.NumberFormat().format(value)
    return props.valueSuffix ? `${formatted} ${props.valueSuffix}` : formatted
};

const getEntityName = (index: PersonIndex | OrganisationUnitIndex) => {
    if ("name" in index) {
        return index.name;
    } else {
        return i18n.locale.value === "sr" ? index.nameSr : index.nameOther;
    }
};

const navigateToEntityLandingPage = (index: PersonIndex | OrganisationUnitIndex) => {
    let pageName;
    if ("name" in index) {
        pageName = "researcherLandingPage";
    } else {
        pageName = "organisationUnitLandingPage";
    }

    router.push({ name: pageName, params: {id: index.databaseId} });
};
</script>

<style scoped>
.leaderboard-container {
    max-width: 600px;
    margin: 0 auto;
}

.leaderboard-card {
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.leaderboard-card:hover {
    transform: translateY(-2px);
}

.card-content {
    display: flex;
    align-items: center;
    padding: 16px;
    min-height: 80px;
}

.trophy-section {
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 16px;
}

.trophy-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.ordinal-number {
    font-size: 24px;
    font-weight: bold;
    color: #666;
    min-width: 40px;
    text-align: center;
}

.info-section {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.value {
    font-size: 20px;
    font-weight: bold;
    color: #1976d2;
}

.gold-card {
    background: linear-gradient(135deg, #fff9c4 0%, #ffeb3b 100%);
    border-left: 4px solid #ffd600;
}

.silver-card {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    border-left: 4px solid #9e9e9e;
}

.bronze-card {
    background: linear-gradient(135deg, #ffccbc 0%, #ffab91 100%);
    border-left: 4px solid #ff7043;
}

.standard-card {
    background: white;
    border-left: 4px solid #1976d2;
}

@media (max-width: 600px) {
    .card-content {
        padding: 12px;
        min-height: 70px;
    }
  
    .trophy-section {
        width: 50px;
        margin-right: 12px;
    }
    
    .trophy-icon {
        width: 35px;
        height: 35px;
    }
    
    .ordinal-number {
        font-size: 20px;
        min-width: 35px;
    }
    
    .name {
        font-size: 16px;
    }
    
    .value {
        font-size: 18px;
    }
}
</style>
