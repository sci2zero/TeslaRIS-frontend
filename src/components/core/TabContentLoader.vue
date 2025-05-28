<template>
    <div>
        <v-skeleton-loader
            v-if="tabNumberByRole ? isUserLoggedIn : true"
            :type="`${buttonHeader ? 'button' : 'chip'}@${tabNumberByRole ? (deduceTabNumberByRole()) : tabNumber}`" />
    </div>
    <div>
        <template v-if="layout === 'table'">
            <v-skeleton-loader type="table" color="grey-lighten-5" />
        </template>
  
        <template v-else-if="layout === 'sections'">
            <v-row v-for="index in 3" :key="index">
                <v-col
                    :key="'paragraph-' + index"
                    cols="12"
                >
                    <v-card color="grey-lighten-5"></v-card>
                    <v-skeleton-loader type="heading" width="30%" />
                    <v-skeleton-loader type="paragraph" width="40%" />
                </v-col>
            </v-row>
        </template>
  
        <!-- List Layout -->
        <template v-else-if="layout === 'list'">
            <!-- Simulate a list with avatar and list item skeletons -->
            <v-card color="grey-lighten-5">
                <v-list>
                    <v-list-item v-for="index in 5" :key="'list-' + index">
                        <v-list-item-avatar>
                            <v-skeleton-loader type="chip" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-skeleton-loader type="text@2" width="30%" />
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
        </template>
  
        <!-- Fallback for unknown layout types -->
        <template v-else>
            <div>Invalid layout type: {{ layout }}</div>
        </template>
    </div>
</template>
  
<script lang="ts">
import { useUserRole } from '@/composables/useUserRole';
import { defineComponent } from 'vue';
  
export default defineComponent({
    name: 'TabContentLoader',
    props: {
      layout: {
        type: String,
        default: 'list',
        validator: (value: string) => {
          return ['table', 'sections', 'list'].includes(value);
        }
      },
      tabNumber: {
        type: Number,
        default: 4
      },
      buttonHeader: {
        type: Boolean,
        default: false
      },
      tabNumberByRole: {
        type: Boolean,
        default: false
      }
    },
    setup() {
        const { isAdmin, isUserLoggedIn } = useUserRole();

        const deduceTabNumberByRole = () => {
            if (isAdmin.value) {
                return 3;
            } else if (isUserLoggedIn) {
                return 1
            }

            return 1;
        };

        return {
            deduceTabNumberByRole,
            isUserLoggedIn
        };
    }
  });
  </script>

  