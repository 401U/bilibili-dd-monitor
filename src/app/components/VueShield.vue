<template>
  <div class="shield">
    <span class="shield-title">{{ title }}</span>
    <span class="shield-content">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, Ref } from 'vue'

defineComponent({
  name: 'vue-shield'
})
defineProps<{
  title: string
  content: string|number
}>()
</script>

<style scoped lang="scss">
.shield {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: .85em;

  &-title {
    line-height: 1.2;
    padding: 2px 4px;
    border-radius: 3px 0 0 3px;
    color: #fff;
    background: #606060;
  }

  &-content {
    line-height: 1.2;
    padding: 2px 4px;
    border-radius: 0 3px 3px 0;
    color: #fff;
    background: #2082bf;
  }
}
</style>
