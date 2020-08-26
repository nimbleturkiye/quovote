<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      backendError: null,
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 }
        }
      },
      tailFormItemLayout: {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0
          },
          sm: {
            span: 16,
            offset: 6
          }
        }
      },
      validationRules: {
        title: ['title', { rules: [{ required: true }] }],
        description: ['description'],
        code: [
          'code',
          {
            rules: [
              { required: false },
              { pattern: /^[a-z0-9]+$/, message: 'Event code can only include lowercase letters and numbers.\n' },
              { min: 3, max: 8, message: 'Event code must be between 3 and 8 characters.\n' }
            ]
          }
        ]
      }
    }
  },
  computed: {
    ...mapState(['user']),
    sortedEvents() {
      return this.user.events.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  },
  beforeCreate() {
    const component = this
    this.createEventForm = this.$form.createForm(this, {
      name: 'createEventForm',
      onValuesChange() {
        component.backendError = null
      }
    })
  },
  methods: {
    ...mapActions(['createEvent']),
    submitCreateEventForm(e) {
      e.preventDefault()
      this.backendError = null
      this.createEventForm.validateFieldsAndScroll(async (err, values) => {
        if (err) return

        try {
          await this.createEvent(values)

          this.createEventForm.resetFields()
        } catch (e) {
          this.backendError = e.response.data
        }
      })
    }
  }
}
</script>

<template lang="pug">
  .dashboard
    .content
      h1 Dashboard
      a-card
        h2 Your events
        a-card(v-for="event in sortedEvents")
          h3
            router-link(:to="`/events/${event._id}`") {{ event.title }}
          p {{ event.description }}
          p
            a-icon(type="message")
            span &nbsp{{ event.questions.length }}
      a-card
        a-form(:form="createEventForm" @submit="submitCreateEventForm")
          h2 Create new event
          a-form-item(label="Event name" v-bind="formItemLayout")
            a-input(placeholder="The name of your event" v-decorator="validationRules.title")
          a-form-item(label="Event description" v-bind="formItemLayout")
            a-input(placeholder="A short description of your event" v-decorator="validationRules.description")
          a-form-item(label="Event code (optional)" v-bind="formItemLayout")
            a-input(placeholder="A short code (slug) for your event" v-decorator="validationRules.code")
            p {{createEventForm.getFieldValue('code') ? `Your event's URL will be: https://quovote.co/${createEventForm.getFieldValue('code')}` : ''}}
          a-form-item(v-bind="tailFormItemLayout" v-if="backendError")
            a-alert(:message="backendError.message" type="error")
          a-form-item(v-bind="tailFormItemLayout")
            a-button(type="primary" @click="submitCreateEventForm" :loading="loading") Create Event
</template>

<style lang="scss" scoped>
.ant-card {
  margin: 24px 0;
}

.ant-card:last-child {
  margin-bottom: 0;
}

p:last-child {
  margin-bottom: 0;
}
</style>
