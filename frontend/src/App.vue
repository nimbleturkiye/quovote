<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState(['user']),
    selectedKeys() {
      return [this.$route.name]
    }
  },
  methods: {
    ...mapActions(['logout']),
    async doLogout() {
      await this.logout()
      this.$router.push('/login?logoutSuccess=1')
    }
  }
}
</script>
<template lang="pug">
  #app
    a-layout#components-layout-demo-top.layout(theme='light')
      a-layout-header
        a-row(type="flex" justify="space-between")
          a-col
            div.logo
              router-link(to="/") QuoVote.
          a-col
            a-menu(theme='light', :selectedKeys="selectedKeys" mode='horizontal', :style="{ lineHeight: '64px' }")
              a-menu-item(key="dashboard" v-if="user")
                router-link(to="/dashboard")
                  | Dashboard
              a-menu-item(key='login' v-if="!user")
                router-link(to="/login")
                  | Log in
              a-menu-item(key='register' v-if="!user")
                router-link(to="/register")
                  | Sign up
              a-menu-item(key='logout' v-if="user" @click="doLogout")
                | Log out
      a-layout-content
        router-view

      a-layout-footer(style='text-align: center')
        | QuoVote ©2020 Armagan Amcalar
</template>

<style lang="scss">
* {
  position: relative;
}

h1 {
  font-weight: 700 !important;
}
</style>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-weight: 500;
  background-color: #f6f6f6;
}

.logo {
  z-index: 1;
  font-weight: bold;
  a {
    height: 100%;
    padding-right: 2em;
    width: 100%;
    display: block;
  }
}

.ant-layout {
  min-height: 100vh;
}

.ant-layout-header {
  background: white;
}

.ant-layout-content {
  max-width: 760px;
  align-self: center;
  padding: 4em;
  @media (max-width: 576px) {
    padding: 1em;
  }

  width: 100%;
}
</style>
