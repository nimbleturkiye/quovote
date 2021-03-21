<script>
import { mapState, mapActions } from 'vuex'

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default {
  data() {
    return {
      triggers: '',
      speechRecognitionInstance: window.SpeechRecognition && new window.SpeechRecognition()
    }
  },
  computed: {
    ...mapState('event', ['event']),
    ...mapState('account', ['user'])
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
      } catch (error) {
        if (error.name == 'InvalidStateError') console.warn('Speech recognition API is already started.')
        else console.warn(error)
      }

      speechRecognitionInstance.addEventListener('result', this.checkAndTriggerVoiceCommands)
      speechRecognitionInstance.addEventListener('end', speechRecognitionInstance.start)
    },
    async skipQuestion() {
      const getLastPinnedQuestion = () => this.event.questions?.find(question => question.isPinned)

      if (!getLastPinnedQuestion()) return

      await this.archiveQuestion({
        action: 'archive',
        questionId: getLastPinnedQuestion()._id
      })

      if (getLastPinnedQuestion()) return

      await this.pinLatestQuestion()
    },
    checkAndTriggerVoiceCommands(e) {
      const transcript = Array.from(e.results)
        .map(result => result[0].transcript)
        .join('')
        .replace(new RegExp(/ı|I|İ/g), 'i')
        .toLowerCase()

      const isTriggered = this.triggers.split('\n').some(trigger => trigger && transcript.includes(trigger))

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
      placeholder='Enter trigger phrases (each line represents a trigger)'
      :autoSize='{ minRows: 5 }'
      v-model="triggers"
    )
    #director-actions
      a-button.director-action.first(@click="skipQuestion") Done, move on
      a-button.director-action(@click="activateVoiceRecognition" :disabled="!speechRecognitionInstance") Activate: Voice-Action
</template>

<style scoped>
#director-actions {
  margin-top: 1.5rem;
}

.director-action {
  margin-left: 1rem;
}

.director-action.first {
  margin: 0;
}
</style>
