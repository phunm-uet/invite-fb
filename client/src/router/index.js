import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import {authRouter, redirectRouter} from './auth.js'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: authRouter
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      beforeEnter: redirectRouter
    }
  ]
})
