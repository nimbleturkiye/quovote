<script>
import { mapState, mapActions } from 'vuex'
import { message, notification } from 'ant-design-vue'

export default {
  name: 'AskTheSpeakerForm',
  props: ['showHeader'],
  data() {
    return {
      name: undefined,
      question: ''
    }
  },
  methods: {
    ...mapActions('event', ['submitQuestion']),
    async sendQuestion() {
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
      }
    }
  },
  computed: {
    ...mapState('event', ['loading'])
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
