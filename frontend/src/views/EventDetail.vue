<script>
import { mapState, mapActions } from 'vuex'
import { notification, message } from 'ant-design-vue'
import moment from 'moment'
import Director from '../components/Director.vue'
import AskTheSpeakerForm from '../components/AskTheSpeakerForm.vue'

export default {
  name: 'event-detail',
  components: {
    Director,
    AskTheSpeakerForm
  },
  data() {
    return {
      moment,
      sortBy: 'popular',
      orderBy: -1,
      questions: [],
      viewingArchive: false
    }
  },
  async created() {
    this.setEventId(this.$route.params.eventId)
    try {
      await this.joinEvent(this.$route.params.eventId)
    } catch (e) {
      notification.error({
        message: e.response?.data?.validation
          ? e.response.data.validation.body.message
          : e.response?.data?.message ?? e.message ?? 'An unknown error occured'
      })
    }
  },
  methods: {
    ...mapActions('event', ['setEventId', 'joinEvent', 'vote', 'withdrawQuestion', 'pinQuestion', 'archiveQuestion']),
    updateSorting(e) {
      if (this.sortBy == e.target.value) {
        this.orderBy = -this.orderBy
      }

      this.sortBy = e.target.value

      this.sortQuestions({ intentional: true })
    },
    sortQuestions({ intentional = false } = {}) {
      const predicate = this.viewingArchive ? q => q.state == 'archived' : q => q.state != 'archived'
      this.questions = this.event.questions.filter(predicate)

      if (this.sortBy == 'random' && !intentional) {
        this.previousQuestionsSortedIds.reverse().forEach(cq => {
          const i = this.questions.findIndex(q => q._id == cq)
          if (i == -1) return
          this.questions.unshift(this.questions.splice(i, 1)[0])
        })

        return
      }

      this.questions.sort((a, b) => {
        if (a.state == 'pinned' && b.state != 'pinned') return -1
        else if (a.state != 'pinned' && b.state == 'pinned') return 1
        else if (this.sortBy == 'popular') return (a.votes - b.votes) * this.orderBy
        else if (this.sortBy == 'random') return Math.random() * 2 - 1
        return (new Date(a.createdAt) - new Date(b.createdAt)) * this.orderBy
      })
    },
    getQuestionTooltipTitle(question) {
      if (!this.user) return 'You need to be logged in order to vote for this question.'
      return question.voted ? 'Unlike' : 'Like'
    },
    handleVote(question) {
      if (!this.user) return

      this.vote({ questionId: question._id, action: question.voted ? 'unlike' : 'like' })

      question.voted = !question.voted
      question.votes += question.voted ? 1 : -1
      this.sortQuestions()
    },
    handleArchive(question) {
      if (this.isUnknownAnonymous) return

      this.archiveQuestion({
        questionId: question._id,
        action: question.state == 'archived' ? 'unarchive' : 'archive'
      })

      this.questions = this.questions.filter(q => q._id != question._id)
    },
    handlePin(question) {
      if (this.user._id != this.event.owner) return

      this.pinQuestion({
        questionId: question._id,
        action: question.state == 'pinned' ? 'unpin' : 'pin'
      })

      question.state = question.state == 'pinned' ? 'visible' : 'pinned'
      this.sortQuestions()
    },
    generateAvatarText(name) {
      let avatarName = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

      return avatarName
    },
    generateAvatarBgColor() {
      let randomNumber = Math.floor(Math.random() * 5)

      return `avatar-bg-${randomNumber}`
    },
    pinLatestQuestion() {
      this.sortBy = 'popular'
      this.sortQuestions()

      this.handlePin(this.questions[0])
    }
  },
  computed: {
    ...mapState('event', ['event']),
    ...mapState('account', ['user']),
    popularSortOrderIndicator() {
      if (this.sortBy != 'popular') return ''
      if (this.orderBy == -1) return ' ▼'
      return ' ▲'
    },
    recentSortOrderIndicator() {
      if (this.sortBy != 'recent') return ''
      if (this.orderBy == -1) return ' ▼'
      return ' ▲'
    },
    randomSortOrderIndicator() {
      if (this.sortBy != 'random') return ''
      return '◆'
    }
  },
  watch: {
    'event.questions'(questions) {
      this.previousQuestionsSortedIds = this.questions.map(q => q._id)

      this.questions = questions.slice()
      this.sortQuestions()
    },
    viewingArchive() {
      this.sortQuestions()
    }
  }
}
</script>

<template lang="pug">
.event-detail
  .content(v-if="event")
    h1 {{ event.title }}
    h3 {{ event.description }}
    a-card
      a-tabs(v-if="event.owner == user._id" default-active-key="2" :animated="false")
        a-tab-pane(tab="Ask the speaker" key="1")
          ask-the-speaker-form
        a-tab-pane(tab="Director" key="2")
          Director(:pin-latest-question="pinLatestQuestion")
      ask-the-speaker-form(v-else :show-header="true")
    a-card
      .questions
        .questions-header
          h2.questions-title Questions
            a-avatar.question-count {{ questions.length }}
          .questions-sort(v-if='questions.length')
            span Sort questions by &nbsp;
            a-radio-group(size='small', defaultValue='popular', buttonStyle='solid', :value='sortBy')
              a-radio-button(value='popular', @click='updateSorting') Popular {{ popularSortOrderIndicator }}
              a-radio-button(value='recent', @click='updateSorting') Recent {{ recentSortOrderIndicator }}
              a-radio-button(value='random', @click='updateSorting') Random {{ randomSortOrderIndicator }}
          .questions-filter(v-if='event.owner == user._id')
            span(style='margin-right: 0.4em') Filter
            a-radio-group(size='small' v-model='viewingArchive')
              a-radio-button(:value='false') Live
              a-radio-button(:value='true') Archived
        .questions-container
          p.no-questions(v-if='!questions.length') This event has no questions, be the first one and ask the first question!
          a-card(v-for='question in questions', :key='question._id', :bordered='false' :class='{pinned: question.state == "pinned"}')
            a-comment
              template(slot='actions')
                a-tooltip(:title='getQuestionTooltipTitle(question)', @click='handleVote(question)')
                  span(key='comment-basic-like')
                    a-icon(type='like', :theme='question.voted ? "filled" : "outlined"')
                  span(style='padding-left: 4px') {{ question.votes }}
                span
                  a-button(type='secondary', v-if='question.ownQuestion', @click='withdrawQuestion(question._id)') Withdraw
                span
                  a-button(type='secondary', v-if='event.owner == user._id', @click='handleArchive(question)') {{ viewingArchive ? 'Unarchive' : 'Archive' }}
              a(slot='author') {{ question.author }}
              a-avatar(v-once, slot='avatar', :class='generateAvatarBgColor()')
                a-icon(v-if='question.author == "Anonymous"', type='user')
                span(v-else) {{ generateAvatarText(question.author) }}
              p(slot='content') {{ question.text }}
              a-tooltip(slot='datetime', :title='moment(question.createdAt).format("YYYY-MM-DD HH:mm:ss")')
                span(:id='"question-" + question._id.slice(-4)') {{ moment(question.createdAt).fromNow() }}
            .pin(v-if="!viewingArchive")
              .question-id {{ "#" + question._id.slice(-4) }}
              a-button(v-if='user._id == event.owner || question.state == "pinned"', type='link', @click='handlePin(question)', :style='{ "pointer-events": user._id == event.owner ? "" : "none" }')
                a-icon(type='pushpin', :theme='question.state == "pinned" ? "filled" : "outlined"')
            hr
</template>

<style lang="scss">
.questions {
  .ant-card {
    .ant-card-body {
      padding: 0px 24px;

      hr {
        height: 1px;
        border: 0;
        border-bottom: 1px solid #e8e8e8;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.questions {
  .questions-header {
    display: block;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;

    .questions-title {
      flex-grow: 1;
    }

    @media (max-width: 680px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .ant-card {
    margin: 0;
    padding-bottom: 16px;
  }

  .questions-container {
    margin-top: 24px;
  }

  .pinned {
    .ant-comment {
      background: rgb(24 144 255 / 3%);
    }
  }
}

.no-questions {
  margin-top: 1em;
}

.questions h2 {
  margin-bottom: 0;
}

.question-count {
  margin-left: 8px;
}

.question-id {
  font-size: 12px;
  line-height: 12px;
  color: #ccc;
  padding-top: 4px;
}

.pin {
  position: absolute;
  right: 0em;
  top: 0em;
  padding: 1em;
  display: flex;
  align-items: center;
}

.questions-tag {
  margin-right: 0;
}

.ant-comment {
  background: white;
}

.ant-card {
  margin: 24px 0;
}

.avatar-bg-0 {
  background-color: #00bfa5;
}

.avatar-bg-1 {
  background-color: #304ffe;
}

.avatar-bg-2 {
  background-color: #aa00ff;
}

.avatar-bg-3 {
  background-color: #ff6d00;
}

.avatar-bg-4 {
  background-color: #00c853;
}
</style>
