<script>
import { mapState, mapActions, mapMutations } from 'vuex'
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
    this.joinEvent(this.$route.params.eventId)
    this.fetchQuestions()
  },
  methods: {
    ...mapActions(['submitQuestion', 'fetchQuestions', 'setProperty', 'joinEvent', 'vote']),
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
  form(@submit.prevent="sendQuestion")
    a-textarea(
      placeholder="Type your question"
      :autosize="{ minRows: 2, maxRows: 6 }"
      v-model="question"
    )
    a-input(placeholder="Your name (optional)" v-model="name")
    a-button(type="primary" @click="sendQuestion" :loading="loading" icon="message") Send
  div(v-for="question in questions" :key="question._id")
    p Question: {{ question.text }}
    strong Author: {{ question.user }}
    div
      p {{ question.votes }}
      div
        a-button-group
          a-button(:type="question.voted ? 'primary' : 'default'" icon="like" @click="vote({ questionId: question._id, vote: question.voted ? 'dislike' : 'like' })")
</template>
