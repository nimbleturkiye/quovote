import axios from 'axios'
import biri from 'biri'

const mutations = {
  SET_COMPUTER_ID: 'setComputerId',
  SET_USER: 'setUser'
}

const actions = {
  RESEND_VERIFICATION_EMAIL: 'resendVerificationEmail',
  REGISTER_COMPUTER_ID: 'registerComputerId',
  REGISTER_USER: 'registerUser',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FETCH_USER: 'fetchUser',
  UPDATE_DIRECTOR: 'updateDirector',
  UPDATE_PROFILE: 'updateProfile',
  INIT: 'init'
}

const account = {
  namespaced: true,
  state: () => ({
    computerId: 0,
    user: null
  }),
  mutations: {
    [mutations.SET_COMPUTER_ID](state, computerId) {
      state.computerId = computerId
    },
    [mutations.SET_USER](state, user) {
      state.user = user
    }
  },
  actions: {
    async [actions.INIT]({ dispatch }) {
      let computerId

      try {
        computerId = await biri()
      } catch (e) {
        console.log('Cannot activate biri.')
      }

      await dispatch(actions.REGISTER_COMPUTER_ID, computerId)
      await dispatch(actions.FETCH_USER)
    },
    async [actions.REGISTER_COMPUTER_ID]({ commit }, computerId) {
      commit(mutations.SET_COMPUTER_ID, computerId)

      await axios.post('/singularity', { computerId })
    },
    async [actions.REGISTER_USER](store, user) {
      return axios.post('/account/register', { user })
    },
    async [actions.LOGIN]({ commit }, credentials) {
      const user = await axios.post('/account/session', credentials)

      commit(mutations.SET_USER, user.data)
    },
    async [actions.LOGOUT]({ commit }) {
      await axios.delete('/account/session')

      commit(mutations.SET_USER, null)
    },
    async [actions.FETCH_USER]({ commit }) {
      const user = await axios.get('/account')

      commit(mutations.SET_USER, user.data)
    },
    async [actions.UPDATE_DIRECTOR](store, director) {
      await axios.patch('/account', { director })
    },
    async [actions.UPDATE_PROFILE](store, profile) {
      await axios.patch('/account/me', profile)
    },
    async [actions.RESEND_VERIFICATION_EMAIL](store, email) {
      await axios.post('/account/outgoing-verification-emails', { email })
    }
  }
}

export default account
