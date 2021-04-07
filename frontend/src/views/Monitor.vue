<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('event', ['event']),
    pinnedQuestion() {
      return this.event?.questions.find(question => question.state == 'pinned')
    }
  },
  methods: {
    ...mapActions('event', ['joinEvent', 'setEventId'])
  },
  async created() {
    this.setEventId(this.$route.params.eventId)

    await this.joinEvent()
  }
}
</script>

<template lang="pug">
  .display-frame(v-if="pinnedQuestion")
    img.quote-left(src="@/assets/quote-left-solid.svg" alt="quote-left")
    .question
      p.question-text {{ pinnedQuestion.text }}
      h2.question-author — {{ pinnedQuestion.author }}
    .votes
      a-icon(type="like" theme="filled")
      span {{ pinnedQuestion.votes }}
</template>

<style lang="scss">
#app.monitor {
  header,
  footer {
    display: none;
  }

  &,
  .ant-layout-content,
  .ant-layout {
    background: transparent;
  }

  .ant-layout-content {
    max-width: unset;
  }
}
</style>

<style lang="scss" scoped>
.display-frame {
  padding: 20px 30px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  width: 950px;
  display: flex;

  .question {
    flex: 10;

    .question-text {
      font-family: sans-serif;
      font-size: 20px;
      color: aliceblue;
    }

    .question-author {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-family: serif;
      font-style: italic;
      color: aliceblue;
    }
  }

  .quote-left {
    height: 60px;
    margin-top: 10px;
    margin-right: 32px;
  }

  .votes {
    color: aliceblue;
    flex: 1;
    font-size: 20px;
    text-align: right;

    i {
      margin-right: 8px;
    }
  }
}
</style>
