


<template>
    <!-- <div class="flex overflow-x-auto p-2 -ml-2">

<div class="bg-white rounded-lg shadow-md py-4 px-4 sm:px-6 lg:px-8 min-w-fit">

    <div class="flex serif gap-4 sm:gap-6 lg:gap-10">
        <div class="flex-shrink-0">
            <div class="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Ukupno</div>
            <div class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">125</div>
        </div>

        <div class="flex-shrink-0">
            <div class="text-gray-600 mb-1 sm:mb-2 text-nowrap text-sm sm:text-base">H-Index</div>
            <div class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">26</div>
        </div>

        <div class="flex items-end gap-2 flex-shrink-0">
            <div>
                <div class="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Citata</div>
                <div class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">1232</div>
            </div>
            <div class="text-base sm:text-lg text-green-800 mb-1 sm:mb-2 flex items-center gap-1">
                <span class="mdi mdi-arrow-up text-sm sm:text-base"></span>
                33
            </div>
        </div>
    </div>
</div>
</div> -->

    <div class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
        <div class="mb-6">
            <h2 class="text-xl lg:text-2xl font-serif font-bold text-slate-800 mb-2">
                Naučni Indikatori
            </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            <!-- Total Publications -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-file-document text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">Ukupno</div>
                    </div>
                </div>
                <div class="text-3xl lg:text-4xl font-bold text-blue-800 mb-1">125</div>
                <div class="text-sm text-blue-600 font-medium">Publikacija</div>
            </div>

            <!-- H-Index -->
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-chart-line text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-emerald-600 font-medium uppercase tracking-wide">H-Index</div>
                    </div>
                </div>
                <div class="text-3xl lg:text-4xl font-bold text-emerald-800 mb-1">26</div>
                <div class="text-sm text-emerald-600 font-medium">Hirsch indeks</div>
            </div>

            <!-- Citations -->
            <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-format-quote-close text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-amber-600 font-medium uppercase tracking-wide">Citata</div>
                    </div>
                </div>
                <div class="text-3xl lg:text-4xl font-bold text-amber-800 mb-1">1,232</div>
                <div class="flex items-center gap-2 text-sm text-amber-600 font-medium">
                    <span class="mdi mdi-trending-up text-base"></span>
                    +33 ove godine
                </div>
            </div>
        </div>

        <!-- Additional Metrics Row -->
        <div class="mt-6 pt-6 border-t border-slate-200">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">89</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">Radovi u časopisu</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">23</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">Konferencije</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">12</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">Knjige</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">1</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">Monografije</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}
</style>