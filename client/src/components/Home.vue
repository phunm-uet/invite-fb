<template>
<div class="container">
  <button class="btn btn-info pull-right" @click="logOut">
    <span class="glyphicon glyphicon-log-out"></span> Log out</button>
  <ul class="nav nav-tabs">
    <li class="active"><a data-toggle="tab" href="#home">Posts </a></li>
    <li><a data-toggle="tab" href="#menu1">Accounts </a></li>
  </ul>

  <div class="tab-content" style="margin-top : 20px">
    <div id="home" class="tab-pane fade in active">
        <tab-post></tab-post>
    </div>
    <div id="menu1" class="tab-pane fade">
      <account></account>
    </div>
  </div>
</div>

</template>
<script>
import TabPost from './Post'
import Account from './Account'
export default {
  name: 'Home',
  components: {TabPost, Account},
  methods: {
    logOut () {
      localStorage.removeItem('token')
      this.$router.push({path: '/login'})
    }
  }
}
</script>
