<script>
import { mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

export default {
  name: 'event-code-redirection',
  data() {
    return {
      error: false
    }
  },
  async created () {
    const eventId = await this.fetchEventIdByCode(this.$route.params.eventCode)

    if (eventId) {
      this.$router.push({ name: 'eventDetail', params: { eventId } })
    } else {
      this.error = true
      notification.error({ message: 'Event cannot be found' })
    }
  },
  methods: {
    ...mapActions(['fetchEventIdByCode'])
  },
  computed: {
    code() {
      return this.$route.params.eventCode
    }
  }
}
</script>

<template lang="pug">
div
  p(v-if="error") Event with code {{ code }} could not be found.
</template>
