<script>
import { mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

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
            ],
            normalize: value => value?.toLowerCase()
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
    ...mapActions('account', ['login', 'resendVerificationEmail']),
    submitLogin(e) {
      e.preventDefault()
      this.backendError = null
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) return
        this.loading = true

        try {
          await this.login(values)
          this.$router.push('/dashboard')
        } catch (e) {
          this.backendError = e.response.data
        } finally {
          this.loading = false
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
    },
    async onResend() {
      if (this.backendError?.type !== 'verification-required' || !this.backendError?.email) {
        return notification.error({ message: 'An unknown error occurred' })
      }

      try {
        const backendError = { ...this.backendError }
        this.backendError = null
        notification.info({ message: 'Request in progress...'})

        await this.resendVerificationEmail(backendError.email)
        notification.success({ message: 'We just sent you another verification email.'})
      } catch (e) {
        notification.error({
          message: e.response?.data?.message || 'An unknown error occurred'
        })
      }
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
  a-card
    a-form(:form="form" @submit="submitLogin")
      h1 Log in to your account
      a-form-item(v-if="$route.query.registerSuccess")
        a-alert(type="success" message="You are now registered!" description="We have sent you a verification email. If you can't find it, please check your spam box.")
      a-form-item(v-if="$route.query.verifySuccess")
        a-alert(type="success" message="Your account is activated!" description="Use your credentials to log in below.")
      a-form-item(v-if="$route.query.verifyFail")
        a-alert(type="error" message="Verification failed!" description=" The link is either invalid or expired.")
      a-form-item(v-if="$route.query.logoutSuccess")
        a-alert(type="success" message="You have successfully logged out." description="Use your credentials to log in below.")
      a-form-item(label="Email address" v-bind="formItemLayout")
        a-input(placeholder="Your email" v-decorator='validationRules.email')
      a-form-item(label="Password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password" v-decorator="validationRules.password")
      a-form-item(v-bind="tailFormItemLayout" v-if="backendError")
        a-alert(type="error")
          p.error-message(v-if="backendError.type == 'verification-required'" slot="message")
            | {{ backendError.message }}&nbsp;
            button.link-button(@click.prevent="onResend") Re-send
          p.error-message(v-else slot="message") {{ backendError.message }}
      a-form-item(v-bind="tailFormItemLayout")
        a-button(type="primary" html-type="submit" :loading="loading") Log in
        div Don't have an account yet? <router-link to="/register">Register</router-link>
</template>

<style lang="scss" scoped>
.error-message {
  margin-bottom: 0;
}
.link-button {
  background: none;
  padding: 0;
  border: none;
  font-weight: 500;
  color: #1890ff;
  outline: none;
  cursor: pointer;
}
</style>
