<template>
  <div class="col-md-10 col-md-offset-1 col-xs-12">
    <a class="btn btn-primary btn-success pull-right" data-toggle="modal" href='#modal-id' disable="true">
      <span class="glyphicon glyphicon-plus"></span> Add Post</a>
      <img src="../assets/loading.gif" style="width : 20%" v-if="loading">
    <table class="table table-hover table-striped" style="margin-top : 20px" v-if="!loading">
          <thead>
              <tr>
                  <th class="text-center hidden-xs"> STT</th>
                  <th></th>
                  <th class="text-center hidden-xs">Post ID</th>
                  <th class="text-center hidden-xs">Page</th>
                  <th class="text-center">Number Invited</th>
                  <th class="text-center">Remaining</th>
                  <th class="text-center"> Status </th>
                  <th class="text-center">Action</th>
                </tr>
          </thead>
          <tbody class="text-center center">
              <tr v-for="(post, index) in posts" :key="post.id">
                  <td class="hidden-xs">{{index+1}}</td>
                  <td><img :src="post.picture" style="width : 50px;"/></td>
                  <td  class="hidden-xs"><a :href="'https://business.facebook.com/'+post.post_id" target="_blank">{{post.post_id}}</a></td>
                  <td class="hidden-xs"><a :href="'https://business.facebook.com/'+post.page_id" target="_blank">{{post.page_name}}</a></td>
                  <td>{{post.num_invited}}</td>
                  <td>
                    <span class="label label-success" v-if="post.remain_inivte > 50">{{post.remain_inivte}}</span>
                    <span class="label label-warning" v-if="(post.remain_inivte > 10 && post.remain_inivte < 50)">{{post.remain_inivte}}</span>
                    <span class="label label-danger" v-if="post.remain_inivte <10 && post.remain_inivte >= 0">{{post.remain_inivte}}</span>
                  </td>
                  <td>
                   <span class="label label-success" v-if="post.status == 1">Running</span>
                   <span class="label label-warning" v-if="post.status == 0">Stoped</span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-danger btn-xs btn-action" @click="deletePost(post.post_id,index)">
                      <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete
                    </button>
                    <button type="button" class="btn btn-warning btn-xs btn-action" @click="updateStatus(post.post_id, index, 0)" v-if="post.status==1">
                      <span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Pause
                    </button>
                    <button type="button" class="btn btn-success btn-xs btn-action" @click="updateStatus(post.post_id, index, 1)" v-if="post.status==0">
                      <span class="glyphicon glyphicon-play" aria-hidden="true"></span> Start
                    </button>
                  </td>
              </tr>
          </tbody>
    </table>
    <div class="modal fade" id="modal-id">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title">Add Post</h4>
          </div>
          <div class="modal-body">
            <form action="" method="POST" role="form" @submit.prevent='addPost'>
              <div class="form-group">
                <label for="">Post ID</label>
                <input type="text" class="form-control" placeholder="Post ID" v-model='postId'>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Submit</button>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import axios from 'axios'
import {URL_API} from '../config'
export default {
  name: 'TabPost',
  data () {
    return {
      posts: [],
      header: '',
      postId: '',
      loading: true
    }
  },
  mounted () {
    this.loadPosts()
  },
  methods: {
    loadPosts () {
      this.loading = true
      let token = localStorage.getItem('token')
      let header = `Bearer ${token}`
      this.header = header
      axios.defaults.headers.common['Authorization'] = header
      axios.get(URL_API + '/posts').then(res => {
        this.posts = res.data
        this.loading = false
      })
    },
    deletePost (postId, index) {
      let message = `Are you sure you want delete post ${postId} ?`
      this.$swal({
        title: 'Are you sure?',
        text: message,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes Delete it!',
        cancelButtonText: 'No, Keep it!',
        showCloseButton: true,
        showLoaderOnConfirm: true
      }).then(result => {
        if (result.value) {
          let urlDelete = URL_API + `/post/${postId}`
          axios.defaults.headers.common['Authorization'] = this.header
          axios.delete(urlDelete).then(res => {
            this.posts.splice(index, 1)
            this.$swal('Success', 'Deleted post ' + postId, 'OK')
          }).catch(err => {
            console.log(err.response)
          })
        }
      })
    },
    addPost () {
      axios.defaults.headers.common['Authorization'] = this.header
      axios.post(URL_API + '/post', {
        post_id: this.postId
      }).then(res => {
        console.log(res)
        this.$nextTick(function () {
          $('#modal-id').modal('hide')
        })
        this.loadPosts()
      })
    },
    updateStatus ( postId, index,status) {
      axios.defaults.headers.common['Authorization'] = this.header
      axios.put(URL_API + `/post/${postId}`,{status : status}).then(res => {
        this.posts[index].status = status
      }).catch(err => {
      })
      
    }
  }
}
</script>
<style>
.btn-action {
  margin: 5px
}
</style>
