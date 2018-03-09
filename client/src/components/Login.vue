<template>
    <div class="container">
        <div class="row vertical-offset-100">
            <div class="col-md-6 col-md-offset-3 col-xs-12">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">Please sign in</h3>
                    </div>
                    <div class="panel-body">
                        <form accept-charset="UTF-8" role="form" @submit.prevent="login">
                          <div class="alert alert-danger" v-if="error">
                            <strong>Error!</strong> {{error}}
                          </div>
                        <fieldset>
                            <div class="form-group">
                                <input class="form-control" placeholder="Username" type="text" v-model="username">
                            </div>
                            <div class="form-group">
                                <input class="form-control" placeholder="Password" v-model="password" type="password" value="">
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input name="remember" type="checkbox" value="Remember Me"> Remember Me
                                </label>
                            </div>
                            <input class="btn btn-lg btn-success btn-block" type="submit" value="Login">
                        </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {URL_LOGIN} from '../config'
import axios from 'axios'
export default {
  name: 'Login',
  data: function () {
    return {
      'username': '',
      'password': '',
      'error': ''
    }
  },
  methods: {
    login () {
      axios.post(URL_LOGIN, {
        username: this.username,
        password: this.password
      }).then(res => {
        let data = res.data
        let token = data.token
        localStorage.setItem('token', token)
        setTimeout(() => {
          this.$router.push({path: '/'})
        }, 500)
      }).catch(err => {
        let status = err.response.status
        if (status === 404) this.error = 'No User Found'
      })
    }
  }
}
</script>
