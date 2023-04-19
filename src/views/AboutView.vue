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


<style scoped lang="scss">
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  h1 {
    margin: 0;
    text-align: center;
  }

  v-btn {
    margin-top: 20px;
  }
}
</style>
