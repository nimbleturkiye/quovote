<script>
import { mapActions, mapState } from 'vuex'
import { debounce } from 'debounce'

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
    ...mapState(['user'])
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
    ...mapActions(['createEvent', 'createEventCode']),
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
    },
    debounceToCreateEventCode: debounce(async function(e) {
      if (!e.target.value) return

      let res = await this.createEventCode(e.target.value)
      this.createEventForm.setFieldsValue({ code: res })
    }, 500)
  }
}
</script>

<template lang="pug">
  .dashboard
    .content
      h1 Dashboard
      a-card
        h2 Your events
        div(v-for="event in user.events")
          router-link(:to="`/${event.code}`") {{ event.title }}
          p {{ event.description }}
      a-card
        a-form(:form="createEventForm" @submit="submitCreateEventForm")
          h2 Create new event
          a-form-item(label="Event name" v-bind="formItemLayout")
            a-input(placeholder="The name of your event" v-decorator="validationRules.title" @input="debounceToCreateEventCode")
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

<style lang="scss" scoped></style>
