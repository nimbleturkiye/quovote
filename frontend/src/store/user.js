const mutations = {
  SET_COMPUTER_ID: 'setComputerId',
  SET_USER: 'setUser',
}

const actions = {
  REGISTER_COMPUTER_ID: 'registerComputerId',
  REGISTER_USER: 'registerUser',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FETCH_SESSION: 'fetchSession',
}

const user = {
  state: {
    computerId: 0,
    user: null
  },
  mutations: {
    [mutations.SET_COMPUTER_ID](state, computerId) {
      state.computerId = computerId
    },
    [mutations.SET_USER](state, user) {
      state.user = user
    }
  },
  actions: {
    async [actions.REGISTER_COMPUTER_ID]({ commit }, computerId) {
      commit(mutations.SET_COMPUTER_ID, computerId)
  
      await axios.post('/singularity', { computerId })
    },
    async [actions.REGISTER_USER](store, user) {
      return axios.post('/account/register', { user })
    },
    async [actions.LOGIN]({ commit }, credentials) {
      try {
        const user = await axios.post('/account/session', credentials)
        commit(mutations.SET_USER, user.data)
      } catch (e) {
        throw e
      }
    },
    async [actions.LOGOUT]({ commit }) {
      await axios.delete('/account/session')
      commit(mutations.SET_USER, null)
    },
    async [actions.FETCH_SESSION]({ commit }) {
      const user = await axios.get('/account/session')
      commit(mutations.SET_USER, user.data)
    },
  }
}

export default user
