<script>
import { mapActions } from 'vuex'

export default {
  name: 'login',
  data() {
    return {
      loading: false,
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
        email: [
          'email',
          {
            rules: [
              { type: 'email', message: 'The input is not valid e-mail.' },
              { required: true, message: 'Please input your e-mail.' }
            ]
          }
        ],
        password: [
          'password',
          { rules: [{ required: true, message: 'Password is required.' }, { validator: this.validateToNextPassword }] }
        ]
      },
      backendError: null
    }
  },
  methods: {
    ...mapActions(['login']),
    submitLogin(e) {
      e.preventDefault()
      this.backendError = null
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) return
        try {
          await this.login(values)
          this.$router.push('/dashboard')
        } catch (e) {
          this.backendError = e.response.data
        }
      })
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form
      if (value && this.confirmPasswordDirty) {
        form.validateFields(['confirmPassword'], { force: true })
      }
      callback()
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmPasswordDirty = this.confirmPasswordDirty || !!value
    },
    onValuesChange() {
      this.backendError = null
    }
  },
  beforeCreate() {
    const component = this
    this.form = this.$form.createForm(this, {
      name: 'login',
      onValuesChange() {
        component.backendError = null
      }
    })
  }
}
</script>

<template lang="pug">
.login
  h1 Login
  a-card
    a-form(:form="form" @submit="submitLogin")
      h2 Log in
      a-form-item(label="Email address" v-bind="formItemLayout")
        a-input(placeholder="Your email" v-decorator='validationRules.email')
      a-form-item(label="Password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password" v-decorator="validationRules.password")
      a-form-item(v-bind="tailFormItemLayout" v-if="backendError")
        a-alert(:message="backendError.message" type="error")
      a-form-item(v-bind="tailFormItemLayout")
        a-button(type="primary" @click="submitLogin" :loading="loading" icon="message") Log in
</template>

<style lang="scss" scoped></style>
