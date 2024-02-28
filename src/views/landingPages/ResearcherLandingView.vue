<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ researcherName }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        Researcher
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-researcher-icon">
                    {{ accountIcon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outline"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>Personal Info</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>BirthDate:</div>
                                <div class="response">
                                    {{ personalInfo.localBirthDate }}
                                </div>
                                <div>Sex:</div>
                                <div class="response">
                                    {{ personalInfo.sex }}
                                </div>
                                <div>Country:</div>
                                <div class="response">
                                    {{ personalInfo.countryId }}
                                </div>
                                <div>APVNT:</div>
                                <div class="response">
                                    {{ personalInfo.apvnt }}
                                </div>
                                <div>MNID:</div>
                                <div class="response">
                                    {{ personalInfo.mnid }}
                                </div>
                                <div>ORCID:</div>
                                <div class="response">
                                    {{ personalInfo.orcid }}
                                </div>
                                <div>Scopus Author ID:</div>
                                <div class="response">
                                    {{ personalInfo.scopusAuthorId }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div>Street and Number:</div>
                                <div class="response">
                                    {{ personalInfo.streetAndNumber }}
                                </div>
                                <div>City:</div>
                                <div class="response">
                                    {{ personalInfo.city }}
                                </div>
                                <div>Place of Birth:</div>
                                <div class="response">
                                    {{ personalInfo.placeOfBrith }}
                                </div>
                                <div>Contact Email:</div>
                                <div class="response">
                                    {{ personalInfo.contactEmail }}
                                </div>
                                <div>Phone Number:</div>
                                <div class="response">
                                    {{ personalInfo.phoneNumber }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outline" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>Keywords</b></div>
                        <v-chip v-for="(keyword, index) in keywords" :key="index" outlined @click="searchKeyword(keyword)">
                            {{ keyword }}
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Biography -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outline" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>Biography</b></div>
                        <p>{{ biography }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Expertises and Skills -->
        <v-row>
            <v-col cols="6">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outline" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>
                        <div><b>Expertises and Skills</b></div>
                        
                        <div v-for="(expertise, index) in expertises" :key="index" class="py-5">
                            <h4><strong>{{ expertise.title }}</strong></h4>
                            <p>{{ expertise.desc }}</p>
                            
                            <!-- <v-list dense>
                                <v-list-item v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex">
                                    <v-list-item-content>{{ attachment.name }}</v-list-item-content>
                                </v-list-item>
                            </v-list> -->
                            <v-list
                                :lines="false"
                                density="compact"
                                class="pa-0"
                            >
                                <v-list-item
                                    v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex"
                                    :value="attachment.name"
                                    color="primary"
                                >
                                    <template #prepend>
                                        <v-icon icon="mdi-file-document-outline"></v-icon>
                                    </template>

                                    <v-list-item-title v-text="attachment.name"></v-list-item-title>
                                </v-list-item>
                            </v-list>
                            <v-divider v-if="index < expertises.length-1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outline" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>
                        <div><b>Involvements</b></div>
                        <div v-for="(involvement, index) in involvements" :key="index" class="py-5">
                            <h4>
                                <strong>{{ involvement.title }}</strong>
                                <v-icon icon="mdi-circle-small">
                                </v-icon>
                                {{ involvement.yearStart }} - {{ involvement.yearEnd }} 
                            </h4>
                            <p>{{ involvement.desc }}</p>
                            
                            <!-- <v-list dense>
                                <v-list-item v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex">
                                    <v-list-item-content>{{ attachment.name }}</v-list-item-content>
                                </v-list-item>
                            </v-list> -->
                            <v-list
                                :lines="false"
                                density="compact"
                                class="pa-0"
                            >
                                <v-list-item
                                    v-for="(attachment, attachmentIndex) in involvement.attachments" :key="attachmentIndex"
                                    :value="attachment.name"
                                    color="primary"
                                >
                                    <template #prepend>
                                        <v-icon icon="mdi-file-document-outline"></v-icon>
                                    </template>

                                    <v-list-item-title v-text="attachment.name"></v-list-item-title>
                                </v-list-item>
                            </v-list>
                            <v-divider v-if="index < involvements.length-1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Involvements -->
        <!-- <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text>
                        <div><b>Involvements</b></div>
                        <v-list dense>
                            <v-list-item v-for="(involvement, index) in involvements" :key="index">
                                <v-list-item-content>{{ involvement }}</v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row> -->

        <!-- Publication Table -->
        <v-btn class="mt-5 mb-1">
            Add Publication
        </v-btn>

        <v-row>
            <v-col cols="12">
                <v-card class="pa-3">
                    <v-card-title><b>Publication Table</b></v-card-title>
                    <v-data-table :headers="headers" :items="publications" item-key="id">
                        <template #items="props">
                            <td>{{ props.item.title }}</td>
                            <td>{{ props.item.authors }}</td>
                            <td>{{ props.item.year }}</td>
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "ResearcherLandingPage",
    setup() {
        const router = useRouter();
      const researcherName = ref('Milos Popovic')
      const accountIcon = ref('mdi-account-circle')
      const personalInfo = ref({
        localBirthDate: '2000-01-25',
        placeOfBrith: 'Sabac, Servia',
        sex: 'Male',
        countryId: 'Serbia',
        streetAndNumber: 'Bulevar Depsota Stefana 7',
        city: 'Novi Sad',
        contactEmail: 'milospopovic@uns.ac.rs',
        phoneNumber: '0631453860',
        apvnt: '5213',
        mnid: '/',
        orcid: '0008-0006-6373-1632',
        scopusAuthorId: '999'
      })
      const keywords = ref(["Cybersecurity", "Research", "Machine learning", "Teaching Assistant", "Montenegro"])
      const biography = ref('Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa aut est! Tempore animi velit necessitatibus nesciunt voluptas soluta voluptatibus non doloremque excepturi illum ipsam, ducimus odio quasi asperiores saepe aliquam tenetur! Illo quibusdam pariatur repellendus id consequatur alias excepturi.')
      const expertises = ref([
        {
            title: "CyberSecurity",
            desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
            attachments: [
                {name: "attahment1"},
                {name: "attahment1"}
            ]
        },
        {
            title: "CyberSecurity 2",
            desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
            attachments: [
                {name: "attahment1"}
            ]
        },
      ])

      const involvements = ref([
      {
            title: "FTN",
            yearStart: "2020",
            yearEnd: "Present",
            desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
            attachments: [
                {name: "Diploma BSc"},
                {name: "Diploma MSc"}
            ]
        },
        {
            title: "FZŽ",
            yearStart: "2020",
            yearEnd: "Present",
            desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
            attachments: [
                {name: "Dipl"},
            ]
        },
      ])

      const publications = ref([{
        title: "Quantum Insights",
        authors: "Ivan Mrsulja, Milos Popovic",
        year: 2024,
      },
      {
        title: "Tech Trends Today",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Nature's Chronicles",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Innovation Insight Journal",
        authors: "Milos Popovic",
        year: 2023,
      },{
        title: "Quantum Insights",
        authors: "Ivan Mrsulja, Milos Popovic",
        year: 2024,
      },
      {
        title: "Tech Trends Today",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Nature's Chronicles",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Innovation Insight Journal",
        authors: "Milos Popovic",
        year: 2023,
      },{
        title: "Quantum Insights",
        authors: "Ivan Mrsulja, Milos Popovic",
        year: 2024,
      },
      {
        title: "Tech Trends Today",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Nature's Chronicles",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Innovation Insight Journal",
        authors: "Milos Popovic",
        year: 2023,
      },{
        title: "Quantum Insights",
        authors: "Ivan Mrsulja, Milos Popovic",
        year: 2024,
      },
      {
        title: "Tech Trends Today",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Nature's Chronicles",
        authors: "Milos Popovic",
        year: 2023,
      },
      {
        title: "Innovation Insight Journal",
        authors: "Milos Popovic",
        year: 2023,
      },
    ])
      const headers = ref([
        { text: 'Title', value: 'title' },
        { text: 'Authors', value: 'authors' },
        { text: 'Year', value: 'year' }
      ])

      const searchKeyword = (keyword) => {
        router.push({name:"advancedSearch", query: { searchQuery: keyword  }})        

      }

      return {researcherName,
                accountIcon,
                personalInfo,
                keywords,
                biography,
                expertises,
                involvements,
                publications,
                headers,
                searchKeyword
                }
    }
    
})

</script>

<style scoped>
    #researcher .large-researcher-icon {
        font-size: 10em;
    }

    #researcher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }


</style>
