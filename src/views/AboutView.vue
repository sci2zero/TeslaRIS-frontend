<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h1>Count: {{ counter.count }}</h1>
    <h1>Double count: {{ counter.doubleCount }}</h1>
    <v-btn @click="counter.increment()">Increment counter</v-btn>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useCounterStore } from '../stores/counter';

export default defineComponent({
  setup() {
    const counter = useCounterStore();

    return {
      counter
    };
  },
});
</script>
