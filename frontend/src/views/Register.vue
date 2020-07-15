<script>
// import { mapState, mapActions } from 'vuex'

export default {
  name: 'register',
  data () {
    return {
      confirmPasswordDirty: false,
      loading: false,
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
      validationRules: {
        name: [ 'name', { rules: [
          { required: true, message:'Your name is required.' }
        ]}],
        email: [ 'email', { rules: [
          { type: 'email', message: 'The input is not valid E-mail.' },
          { required: true, message: 'Please input your E-mail.' }
        ]}],
        password: [ 'password', { rules: [
          { required: true, message: 'Password is required.'},
          { validator: this.validateToNextPassword }
        ]}],
        passwordConfirmation: [ 'passwordConfirmation', { rules: [
          { required: true, message: 'Password confirmation is required.'},
          { validator: this.compareToFirstPassword }
        ]}]
      }
    }
  },
  methods: {
    register () {
      console.log('register')
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form;
      if (value && this.confirmPasswordDirty) {
        form.validateFields(['confirmPassword'], { force: true });
      }
      callback();
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue('password')) {
        callback('The passwords you entered are inconsistent.');
      } else {
        callback();
      }
    },
    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmPasswordDirty = this.confirmPasswordDirty || !!value;
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'register' });
  },
}
</script>

<template lang="pug">
.register
  h1 Register
  a-card
    a-form(:form="form" @submit="register")
      h2 Create an account
      a-form-item(label="Name" v-bind="formItemLayout")
        a-input(placeholder="Your name" v-decorator="validationRules.name")
      a-form-item(label="Email address" v-bind="formItemLayout")
        a-input(placeholder="Your email" v-decorator='validationRules.email')
      a-form-item(label="Password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password" v-decorator="validationRules.password")
      a-form-item(label="Confirm password" v-bind="formItemLayout")
        a-input(type="password" placeholder="Your password again" v-decorator="validationRules.passwordConfirmation" @blur="handleConfirmBlur")
      a-button(type="primary" @click="register" :loading="loading" icon="message") Register
</template>

<style lang="scss" scoped>

</style>
