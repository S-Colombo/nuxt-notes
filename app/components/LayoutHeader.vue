<template>
  <div class="header">
    <NuxtLink to="/">
      <IconLogo class="header__logo" />
    </NuxtLink>
    <div class="header__content">
      <div class="header__menu">
        <NuxtLink to="/edit">Редактировать заметку</NuxtLink>
      </div>
      <div class="header__hr"/>   
    </div>
  </div>
</template>

<style scoped lang="scss">
.header {
  padding: 0 16px;
  margin: 0 auto;
  max-width: 1248px;
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  border-bottom: 1px solid var(--color-gray);

  &__logo {
    
  }

  &__content {
    display: flex;
    gap: 60px;
    align-items: center;
  }

  &__menu {
    display: flex;
    gap: 60px;
    align-items: center;
  }
}

.header__menu a {
  font-size: 16px;
  line-height: 27px;
  color: var(--color-black);
  text-decoration: none;
  padding-bottom: 48px;
}

.header__menu a:hover {
  color: var(--color-dark-gray);
}

.header__menu a.router-link-active {
  border-bottom: 1px solid var(--color-black);
}

.header__icons {
  display: flex;
  gap: 40px;
  align-items: center;
}

.header__icons a {
  padding-bottom: 48px;
}

.header__icons a.router-link-active {
  border-bottom: 1px solid var(--color-black);
}

.header__hr {
  border-left: 1px solid var(--color-dark-gray);
  height: 17px;
  align-self: flex-start;
  margin-top: 4px;
}
</style>
