<script>
import { mapActions, mapState } from 'vuex'
import { notification } from 'ant-design-vue'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      backendError: null,
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 },
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0,
          },
          sm: {
            span: 16,
            offset: 6,
          },
        },
      },
      validationRules: {
        title: ['title', { rules: [{ required: true, min: 3, max: 80 }] }],
        description: ['description'],
        code: [
          'code',
          {
            rules: [
              { required: false },
              { pattern: /^[a-z0-9]+$/, message: 'Event code can only include lowercase letters and numbers.\n' },
              { min: 3, max: 8, message: 'Event code must be between 3 and 8 characters.\n' },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapState('account', ['user']),
    sortedEvents() {
      return (
        this.user &&
        this.user.events &&
        this.user.events.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    },
  },
  beforeCreate() {
    const component = this
    this.createEventForm = this.$form.createForm(this, {
      name: 'createEventForm',
      onValuesChange() {
        component.backendError = null
      },
    })
  },
  methods: {
    ...mapActions('event', ['createEvent']),
    submitCreateEventForm(e) {
      e.preventDefault()
      this.backendError = null
      this.createEventForm.validateFieldsAndScroll(async (err, values) => {
        if (err) return

        try {
          await this.createEvent(values)

          notification.success({
            message: 'Event created successfully',
          })

          this.createEventForm.resetFields()
        } catch (e) {
          this.backendError = {
            message: e.response?.data?.validation
              ? e.response.data.validation.body.message
              : e.response?.data?.message ?? e.message ?? 'An unknown error occured',
          }
        }
      })
    },
    focusOnCreateEventForm() {
      this.$nextTick(() => this.$refs.eventName.focus())
    },
  },
}
</script>

<template lang="pug">
  .dashboard
    .content
      h1 Dashboard
      a-card
        h2 Your events
        a-empty(v-if="user && !user.events.length")
          span(slot="description") You haven't created any events. <br> Click the button below to create your first event 🎉
          a-button(type="primary" @click="focusOnCreateEventForm" icon="plus") Create Event
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
            a-input(placeholder="The name of your event" v-decorator="validationRules.title" ref="eventName" :maxLength="80")
          a-form-item(label="Event description" v-bind="formItemLayout")
            a-input(placeholder="A short description of your event" v-decorator="validationRules.description" :maxLength="280")
          a-form-item(label="Event code (optional)" v-bind="formItemLayout")
            a-input(placeholder="A short code (slug) for your event" v-decorator="validationRules.code" :maxLength="20")
            p {{createEventForm.getFieldValue('code') ? `Your event's URL will be: https://quo.vote/${createEventForm.getFieldValue('code')}` : ''}}
          a-form-item(v-bind="tailFormItemLayout" v-if="backendError")
            a-alert(:message="backendError.message" type="error")
          a-form-item(v-bind="tailFormItemLayout")
            a-button(type="primary" html-type="submit" :loading="loading" icon="plus") Create Event
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
