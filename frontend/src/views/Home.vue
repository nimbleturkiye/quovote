<script>
import { mapState, mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

export default {
  name: 'home',
  data () {
    return {
      question: '',
      name: undefined
    }
  },
  created () {
    this.setProperty({ eventId: this.$route.params.eventId })
    this.fetchQuestions()
  },
  methods: {
    ...mapActions(['submitQuestion', 'fetchQuestions', 'setProperty']),
    async sendQuestion () {
      try {
        await this.submitQuestion({ question: this.question, name: this.name })

        this.question = ''
      } catch (e) {
        notification.error({ message: e.message })
      }
    }
  },
  computed: {
    ...mapState(['questions', 'loading'])
  }
}
</script>

<template lang="pug">
.home
  div(v-for="question in questions")
    p(v-show="loading") Loading
    strong {{ question.user }}
    p {{ question.text }}
    p {{ question.votes }}
  form(@submit.prevent="sendQuestion")
    a-textarea(
      placeholder="Type your question"
      :autosize="{ minRows: 2, maxRows: 6 }"
      v-model="question"
    )
    a-input(placeholder="Your name (optional)" v-model="name")
    a-button(type="primary" @click="sendQuestion") Send
</template>
