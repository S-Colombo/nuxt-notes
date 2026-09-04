<template>
  <div class="footer">
    <hr >
    <div class="footer__info">
      <div>© {{ new Date().getFullYear() }} Project by <b>Sergey Kalabin</b> | Phone: 89271646167</div>
      <div class="footer__social">
        <NuxtLink to="https://t.me/serjiokolombo" target="_blank">
          <NuxtIcon name="logo-telegram" />
        </NuxtLink>
        <NuxtLink to="https://vk.ru/sergkalabin" target="_blank">
          <NuxtIcon name="logo-vk" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/styles/mixins" as *;

.footer {
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: 100%;
  padding: 0 16px 30px;
  margin: auto auto 0 auto;
  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    @include breakpointMax(767px) {
      flex-direction: column;
    }
  }
  &__social {
    display: flex;
    gap: 20px;
    :deep(.nuxt-icon svg) {
      width: 30px;
      height: 30px;
      margin: 0;
    }
    a {
      color: var(--color-dark-gray);
      transition: all 0.2s linear;
      &:hover {
        color: var(--color-dark);
      }
    }
  }
  hr {
    border: none;
    border-bottom: 1px solid var(--color-gray);
    height: 1px;
  }
}
</style>
