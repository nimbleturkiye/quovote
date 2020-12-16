<script>
import { mapActions } from 'vuex'

export default {
  name: 'register',
  data() {
    return {
      confirmPasswordDirty: false,
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
        name: [
          'name',
          {
            rules: [{ required: true, message: 'Your name is required.' }]
          }
        ],
        email: [
          'email',
          {
            rules: [
              { type: 'email', message: 'E-mail is not valid.' },
              { required: true, message: 'E-mail is required.' }
            ],
            normalize: value => value.toLowerCase()
          }
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: 'Password is required.' },
              { min: 8, message: 'Password should have a minimum length of 8 characters.\n' },
              {
                pattern: /[a-zA-Z]/,
                message: 'Password should include at least one letter.\n'
              },
              { pattern: /\d/, message: 'Password should include at least one digit.\n' },
              { pattern: /[\W_]/, message: 'Password should include at least one symbol.\n' },
              { pattern: /^\S+$/, message: 'Password should not include spaces.\n' },
              { validator: this.validateToNextPassword }
            ]
          }
        ],
        passwordConfirmation: [
          'passwordConfirmation',
          {
            rules: [
              { required: true, message: 'Password confirmation is required.' },
              { validator: this.compareToFirstPassword }
            ]
          }
        ]
      },
      backendError: null
    }
  },
  methods: {
    ...mapActions('account', ['registerUser']),
    register(e) {
      e.preventDefault()
      this.backendError = null
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) return

        try {
          await this.registerUser(values)
          this.$router.push('/login?registerSuccess=1')
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
    compareToFirstPassword(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('password')) {
        callback('The passwords you entered are inconsistent.')
      } else {
        callback()
      }
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
      name: 'register',
      onValuesChange() {
        component.backendError = null
      }
    })
  }
}
</script>

<template lang="pug">
.register
  a-card
    a-form(:form="form" @submit="register")
      h1 Create an account
      a-form-item(label="Name" v-bind="formItemLayout")
        a-input(placeholder="Your name" v-decorator="validationRules.name")
      a-form-item(label="Email address" v-bind="formItemLayout")
        a-input(placeholder="Your email" v-decorator='validationRules.email')
      a-form-item(label="Password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password" v-decorator="validationRules.password")
      a-form-item(label="Confirm password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password again" v-decorator="validationRules.passwordConfirmation" @blur="handleConfirmBlur")
      a-form-item(v-bind="tailFormItemLayout" v-if="backendError")
        a-alert(class="backend-errors" :message="backendError.message" type="error")
      a-form-item(v-bind="tailFormItemLayout")
        a-button(type="primary" html-type="submit" :loading="loading" icon="message") Register
        div Already have an account? <router-link to="/login">Log in</router-link>
</template>

<style lang="scss">
.ant-form-explain {
  white-space: pre-line;
}
</style>
<style lang="scss" scoped>
.backend-errors {
  white-space: pre-line;
}
</style>
