<script>
import { mapActions } from 'vuex'
import { message, notification } from 'ant-design-vue'

export default {
  name: 'AskTheSpeakerForm',
  props: ['showHeader'],
  data() {
    return {
      name: undefined,
      question: '',
      loading: false
    }
  },
  methods: {
    ...mapActions('event', ['submitQuestion']),
    async sendQuestion() {
      this.loading = true

      try {
        await this.submitQuestion({ question: this.question, name: this.name })

        message.success('Question added 🎉')

        this.question = ''
      } catch (e) {
        notification.error({
          message: e.response?.data?.validation
            ? e.response.data.validation.body.message
            : e.response?.data?.message ?? e.message ?? 'An unknown error occured'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template lang="pug">
  form(@submit.prevent="sendQuestion")
    h2(v-if="showHeader") Ask the speaker
    a-textarea(
      placeholder='Type your question',
      :autoSize='{ minRows: 2, maxRows: 6 }',
      :maxLength='280',
      v-model='question'
    )
    a-input(placeholder='Your name (optional)', v-model='name', :maxLength='40')
    a-button(type='primary', @click="sendQuestion" :loading='loading', icon='message') Send
</template>

<style lang="scss" scoped>
form > * {
  margin: 0.5rem 0 !important;
}

textarea {
  padding: 0.5rem;
}
</style>
