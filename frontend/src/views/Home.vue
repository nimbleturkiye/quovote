<script>
import { mapState, mapActions } from 'vuex'
import { notification } from 'ant-design-vue'
import moment from 'moment'

export default {
  name: 'home',
  data () {
    return {
      question: '',
      name: undefined,
      moment,
      sortBy: 'popular',
      questions: []
    }
  },
  created () {
    this.setProperty({ eventId: this.$route.params.eventId })
    this.joinEvent(this.$route.params.eventId)
  },
  methods: {
    ...mapActions(['submitQuestion', 'setProperty', 'joinEvent', 'vote']),
    async sendQuestion () {
      try {
        await this.submitQuestion({ question: this.question, name: this.name })

        this.question = ''
      } catch (e) {
        notification.error({ message: e.message })
      }
    },
    updateSorting (e) {
      this.sortBy = e.target.value

      this.sortQuestions()
    },
    sortQuestions () {
      this.questions.sort((a, b) => {
        if (this.sortBy == 'popular') return b.votes - a.votes

        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }
  },
  computed: {
    ...mapState(['event', 'loading'])
  },
  watch: {
    'event.questions' (questions) {
      this.questions = questions.slice()
      this.sortQuestions()
    }
  }
}
</script>

<template lang="pug">
a-layout.home
  a-layout-content
    a-row(type="flex" justify="center")
      a-col(span="12" :sm="16" :xs="24")
        h1 {{ event.title }}
        form(@submit.prevent="sendQuestion")
          span Ask the speaker
          a-textarea(
            placeholder="Type your question"
            :autoSize="{ minRows: 2, maxRows: 6 }"
            v-model="question"
          )
          a-input(placeholder="Your name (optional)" v-model="name")
          a-button(type="primary" @click="sendQuestion" :loading="loading" icon="message") Send
          a-row(type="flex" justify="space-between")
        a-layout-content
          a-row(type="flex" justify="space-between")
            a-col(span="16")
              span Sort questions by &nbsp;
              a-radio-group(size="small" defaultValue="popular" buttonStyle="solid" @change="updateSorting")
                a-radio-button(value="popular") Popular
                a-radio-button(value="recent") Recent
            a-col(span="8" class="question-counter")
              a-tag(color="purple" class="questions-tag") {{event.questions && event.questions.length}} questions
          a-row
            a-card(v-for="question in questions" :key="question._id" :bodyStyle="{'padding-bottom': '8px'}")
              a-comment
                template(slot="actions")
                  a-tooltip(:title="question.voted ? 'Dislike' : 'Like'" @click="vote({ questionId: question._id, vote: question.voted ? 'dislike' : 'like' })")
                    span(key="comment-basic-like")
                      a-icon(type="like" :theme="question.voted ? 'filled' : 'outlined'")
                    span(style="padding-left: 4px") {{ question.votes }}
                a(slot="author") {{ question.user }}
                a-avatar(
                  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                  alt="Han Solo"
                  slot="avatar")
                p(slot="content") {{ question.text }}
                a-tooltip(slot="datetime" :title="moment(question.createdAt).format('YYYY-MM-DD HH:mm:ss')")
                  span {{ moment(question.createdAt).fromNow() }}
    </a-tooltip>
</template>

<style lang="scss" scoped>
  .home {
    padding: 4em;
  }

  .question-counter {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .questions-tag {
    margin-right: 0;
  }

  .ant-comment {
    background: white
  }

  .ant-card {
    margin: 24px 0;
  }

  form > * {
    margin: 8px 0 !important;
  }

  textarea {
    padding: 8px;
  }

</style>
