<template>
<div class="container">
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
  components: {TabPost,Account}
}
</script>
