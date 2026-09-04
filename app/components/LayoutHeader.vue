<template>
  <div class="header">
    <NuxtLink
      to="/"
      class="header__brand"
      aria-label="На главную"
    >
      <IconLogo class="header__logo" />
    </NuxtLink>
    <nav class="header__menu">
      <NuxtLink to="/">
        Заметки
      </NuxtLink>
      <NuxtLink to="/edit">
         Создание / редактирование
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import IconLogo from '~/components/icon/IconLogo.vue'
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1248px;
  padding: 0 16px;
  margin: 48px auto 0;
  border-bottom: 1px solid var(--color-gray);
  &__brand {
    display: inline-flex;
    padding-bottom: 24px;
  }
  &__menu {
    display: flex;
    gap: 40px;
    align-items: center;
    a {
      padding-bottom: 24px;
      border-bottom: 1px solid transparent;
      font-size: 16px;
      line-height: 27px;
      color: var(--color-black);
      text-decoration: none;
      transition: all 0.2s linear;
      &:hover {
        color: var(--color-dark-gray);
      }
      &.router-link-active {
        border-bottom-color: var(--color-black);
      }
    }
  }
}
</style>
