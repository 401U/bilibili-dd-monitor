<script setup lang="ts">
import { ref } from 'vue'
import SettingService from '@/services/SettingService'
const isNotifiedOnStart = ref(false)
const settingsPath = ref('')
const settingService = new SettingService()

function handleIsNotifiedOnStartChange() {
  settingService.setIsNotifiedOnStart(!isNotifiedOnStart.value).subscribe((value) => {
    isNotifiedOnStart.value = value
  })
}

function openSettingsPath() {
  settingService.openPathOfSettings()
}

settingService.getIsNotifiedOnstart().subscribe((value) => {
  isNotifiedOnStart.value = value
})
settingService.getPathOfSettings().subscribe((path) => {
  settingsPath.value = path
})
</script>

<template>
  <div class="setting-container">
    <div class="setting-item">
      <p class="setting-item-description">
        启动时通知正在进行的直播
      </p>
      <input
        type="checkbox"
        :checked="isNotifiedOnStart"
        class="setting-item-notify-me-about-live-when-start"
        @click="handleIsNotifiedOnStartChange()"
      >
    </div>
    <div class="setting-item">
      <p class="setting-item-description">
        配置文件路径: <span class="setting-item-settings-path">{{ settingsPath }}</span>
      </p>
      <button class="setting-item-open-settings-path" @click="openSettingsPath()">
        打开
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting-container {
  margin-left: 20px;
}

.setting-item {

  &:nth-child(n+2) {
    border-top: 1px solid rgba(0, 0, 0, .5);
  }

  &-description {
    margin: 16px 0;
    font-size: 0.85em;
    color: #666262;
  }

  // modified from https://www.youtube.com/watch?v=BQSNBa3gZJU
  &-notify-me-about-live-when-start {
    position: relative;
    width: 45px;
    height: 20px;
    appearance: none;
    background: #e2e2e2;
    outline: none;
    border-radius: 10px;
    transition: 0.4s;

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      top: 0;
      left: 0;
      background: #ffffff;
      transform: scale(0.8);
      transition: 0.5s;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }

    &:checked {
      background: #3da2ff;

      &::before {
        left: 25px;
      }
    }
  }

  &-open-settings-path {
    padding: 2px 6px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    transition-duration: 0.4s;
    cursor: pointer;
    background-color: white;
    color: black;
    border: 2px solid #f44336;
    border-radius: 2px;

    &:hover {
      background-color: #f44336;
      color: white;
    }

  }
}
</style>
