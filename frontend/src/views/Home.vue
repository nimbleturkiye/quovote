<script>
import { mapState } from 'vuex'

export default {
  name: 'home',
  beforeCreate() {
    this.form = this.$form.createForm(this, {
      name: 'event-code',
    })
  },
  methods: {
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (err) return
        this.$router.push(`/${values.code}`)
      })
    }
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>
<template lang="pug">
.home
  h1 QuoVote.

  a-card
    h2 Join an existing event
    p If you know the event code, you can join instantly!
    a-form(:form="form" @submit.prevent="handleSubmit" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }")
      a-form-item(label="Event code")
        a-input(v-decorator="['code', { rules: [{ required: true, message: 'Please enter an event code.' }] },]")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary" html-type="submit")
          | Join an existing event
  h2 Present Q&A sessions with style
  p QuoVote lets you have a Q&A session with any audience. Protect your events from uninvited guests and ensure user singularity.

  .buttons
    router-link(to="/login")
      a-button(v-if="!user" type="primary" size="large") Log in to start an event
    router-link(to="/register")
      a-button(v-if="!user" type="primary" ghost size="large") Register a new account
    router-link(to="/dashboard")
      a-button(v-if="user" type="primary" size="large") Go to your dashboard

</template>

<style lang="scss" scoped>
h1 {
  font-size: 4em;
  color: var(--antd-wave-shadow-color)
}
h2 { font-size: 2em }
p { font-size: 1.4em }

.buttons button {
  margin-right: 1em
}

.ant-card {
  margin-bottom: 2em
}

</style>
