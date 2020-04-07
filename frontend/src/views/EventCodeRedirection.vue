<script>
import { mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

export default {
  name: 'event-code-redirection',
  async created () {
    const eventId = await this.fetchEventIdByCode(this.$route.params.eventCode)

    if (eventId) {
      this.$router.push({ name: 'eventDetail', params: { eventId } })
    } else {
      notification.error({ message: 'Event cannot be found' })
    }
  },
  methods: {
    ...mapActions(['fetchEventIdByCode'])
  }
}
</script>

<template lang="pug">
.home
  p Redirecting to original event...
</template>
