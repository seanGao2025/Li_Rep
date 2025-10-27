<template>
  <div class="avatar-main">
    <avatar-header />
    <div class="jflex-menus-cover">
      <div class="jflex-content">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import avatarHeader from './Header/index.vue'
</script>
