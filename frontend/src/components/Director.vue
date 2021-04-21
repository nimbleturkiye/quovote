<script>
import { mapState, mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechRecognitionInstance = window.SpeechRecognition && new window.SpeechRecognition()

const STATES = {
  UNAVAILABLE: -1,
  INACTIVE: 0,
  ACTIVE: 1,
  PROCESSING: 2 // Give feedback to user for more effective usage
}

export default {
  created() {
    // STATES is constant and doesn't need to be reactive, but we want to access this in template.
    // Therefore it is assigned in created() hook
    this.STATES = STATES
  },
  data() {
    return {
      triggers: '',
      speechRecognitionInstance,
      state: speechRecognitionInstance ? STATES.INACTIVE : STATES.UNAVAILABLE
    }
  },
  computed: {
    ...mapState('event', ['event']),
    ...mapState('account', ['user']),
    noQuestionLeft() {
      return !this.event.questions.length || this.event.questions.every(q => q.state == 'archived')
    }
  },
  props: ['pinLatestQuestion'],
  methods: {
    ...mapActions('event', ['archiveQuestion']),
    ...mapActions('account', ['updateDirector']),
    activateVoiceRecognition() {
      const { speechRecognitionInstance } = this

      speechRecognitionInstance.lang = this.user.director.language

      try {
        speechRecognitionInstance.start()
        this.state = this.STATES.ACTIVE
      } catch (error) {
        if (error.name == 'InvalidStateError') console.warn('Speech recognition API is already started.')
        else console.warn(error)
      }

      speechRecognitionInstance.addEventListener('result', this.checkAndTriggerVoiceCommands)
      speechRecognitionInstance.addEventListener('end', speechRecognitionInstance.start)
    },
    async skipQuestion() {
      if (this.noQuestionLeft) return

      const pinnedQuestions = this.event.questions?.filter(question => question.state == 'pinned')

      try {
        if (pinnedQuestions[0]) {
          await this.archiveQuestion({
            action: 'archive',
            questionId: pinnedQuestions[0]._id
          })
        }

        if (pinnedQuestions.length > 1) return

        if (!this.noQuestionLeft) await this.pinLatestQuestion()
      } catch (e) {
        notification.error({ message: e.response?.data?.message ?? e.message ?? 'An unknown error occured' })
      }
    },
    checkAndTriggerVoiceCommands(e) {
      this.state = this.STATES.PROCESSING
      setTimeout(() => (this.state = this.STATES.ACTIVE), 1000)

      const transcript = Array.from(e.results)
        .map(result => result[0].transcript)
        .join('')
        .replace(new RegExp(/ı|I|İ/g), 'i')
        .toLowerCase()

      // easter-egg :)
      if (this.user.director.language == 'tr-TR' && transcript.includes('ver mehteri')) {
        this.$refs.mehter.play()
      }

      const isTriggered = this.triggers.split('\n').some(trigger => trigger && transcript.includes(trigger))

      console.log({ transcript, isTriggered })

      if (isTriggered) this.skipQuestion()
    }
  },
  mounted() {
    this.triggers = this.user.director.triggers.join('\n')
  },
  beforeDestroy() {
    const { speechRecognitionInstance } = this

    if (!speechRecognitionInstance) return

    speechRecognitionInstance.removeEventListener('result', this.checkAndTriggerVoiceCommands)
    speechRecognitionInstance.removeEventListener('end', speechRecognitionInstance.start)

    speechRecognitionInstance.stop()
  },
  watch: {
    triggers(newTriggers, oldTriggers) {
      const director = {
        triggers: newTriggers.split('\n').filter(t => t),
        language: this.user.director.language
      }

      this.updateDirector(director)
    }
  }
}
</script>

<template lang="pug">
  #director
    a-textarea(
      v-if="state != STATES.UNAVAILABLE"
      placeholder='Enter trigger phrases (each line represents a trigger)'
      :autoSize='{ minRows: 5 }'
      v-model="triggers"
    )
    #director-actions
      a-button(type='primary' @click="skipQuestion" :disabled="noQuestionLeft") Skip question
      #voice-interface(v-if="state != STATES.UNAVAILABLE")
        audio(ref="mehter" src="/mehter.mp3")
        a-button(@click="activateVoiceRecognition" :disabled="state != STATES.INACTIVE") Activate: Voice-Action
        transition(name="slide-fade")
          p.director-listening-state(v-show="state == STATES.ACTIVE") Listening...
      a(:href="`${$router.history.current.path}/monitor`" target="_blank").go-to-monitor Go to monitor
</template>

<style lang="scss" scoped>
#director-actions {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;

  .go-to-monitor {
    margin-left: auto;
  }
}

#voice-interface {
  display: flex;
  align-items: center;

  * {
    margin-left: 1rem;
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.director-listening-state {
  margin-bottom: 0;
  color: var(--antd-wave-shadow-color);
}
</style>
