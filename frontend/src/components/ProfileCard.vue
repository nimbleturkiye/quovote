<script>
import { mapState, mapActions } from 'vuex'
import { notification } from 'ant-design-vue'

export default {
  name: 'ProfileCard',
  data() {
    return {
      loading: false,
      validationRules: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: 'Name is required.' },
              { min: 2, message: 'Name should have a minimum length of 2 characters.\n' },
              { max: 64, message: 'Name should have a maximum length of 64 characters.\n' }
            ]
          }
        ],
        currentPassword: ['currentPassword'],
        newPassword: [
          'newPassword',
          {
            rules: [
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
        newPasswordConfirmation: [
          'newPasswordConfirmation',
          {
            rules: [{ validator: this.compareToFirstPassword }]
          }
        ]
      }
    }
  },
  computed: {
    ...mapState('account', ['user'])
  },
  methods: {
    ...mapActions('account', ['updateProfile']),
    handleFormSubmit() {
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) return

        this.loading = true

        try {
          await this.updateProfile(values)
          notification.success({ message: 'Profile updated successfully' })
        } catch (e) {
          notification.error({ message: e.response?.data?.message })
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
    compareToFirstPassword(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('newPassword')) {
        callback('The passwords you entered are inconsistent.')
      } else {
        callback()
      }
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmPasswordDirty = this.confirmPasswordDirty || !!value
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, {
      name: 'register'
    })
  },
  mounted() {
    this.form.setFieldsValue({ name: this.user.name })
  }
}
</script>

<template lang="pug">
  a-card
    h2 Profile
    a-form(:form="form" @submit.prevent="handleFormSubmit" hideRequiredMark)
      a-form-item(label="Name")
        a-input(placeholder="Your name" v-decorator="validationRules.name")
      a-form-item(label="Current Password")
        a-input(type="password" placeholder="Current password" v-decorator="validationRules.currentPassword")
      a-form-item(label="New Password")
        a-input(type="password" placeholder="New password" v-decorator="validationRules.newPassword")
      a-form-item(label="New password Confirmation")
        a-input(type="password" placeholder="Confirm new password" v-decorator="validationRules.newPasswordConfirmation" @blur="handleConfirmBlur")
      a-form-item
        a-button(type="primary" html-type="submit" :loading="loading") Save
</template>

<style lang="scss" scoped>
.ant-row.ant-form-item {
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  .ant-btn {
    float: right;
  }
}
</style>
