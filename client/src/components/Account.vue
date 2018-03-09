<template>
    <div class="col-md-8 col-md-offset-2 col-xs-12">
        <a class="btn btn-primary btn-success pull-right" data-toggle="modal" href='#modal-acc'>Add Account</a>
        <table class="table table-striped table-hover"  style="margin-top : 20px">
            <thead>
                <tr>
                    <th class="text-center">ID</th>
                    <th class="text-center">User Id</th>
                    <th class="text-center">User Name</th>
                    <!-- <th>Token</th> -->
                    <th class="text-center">Status</th>
                    <th class="text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='(acc,index) in accounts' :key="index">
                    <td>{{acc.id}}</td>
                    <td>{{acc.user_id}}</td>
                    <td>{{acc.name}}</td>
                    <!-- <td>{{acc.access_token}}</td> -->
                    <td>
                      <span class="label label-primary label-xs" v-if="acc.status == 1">Live</span>
                      <span class="label label-danger label-xs" v-if="acc.status == 0">Die</span>
                    </td>
                    <td><button class="btn btn-danger btn-xs" @click='deleteAcc(acc.id,index)'>Delete</button></td>
                </tr>
            </tbody>
        </table>
        <div class="modal fade" id="modal-acc">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                  <h4 class="modal-title">Add Account</h4>
                </div>
                <div class="modal-body">
                  <form action="" method="POST" role="form" @submit.prevent='addAccount'>
                    <div class="form-group">
                      <label for="">Input Access Token</label>
                      <input type="text" class="form-control" placeholder="Access Token" v-model='accessToken'>
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
import axios from 'axios'
import {URL_API} from '../config'
export default {
  data () {
    return {
      accounts: [],
      accessToken: '',
      header: ''
    }
  },
  mounted () {
    this.loadAccounts()
  },
  methods: {
    loadAccounts () {
      let token = localStorage.getItem('token')
      let header = `Bearer ${token}`
      this.header = header
      axios.defaults.headers.common['Authorization'] = header
      axios.get(URL_API + '/accounts').then(res => {
        this.accounts = res.data
      })
    },
    addAccount (accessToken) {
      axios.defaults.headers.common['Authorization'] = this.header
      axios.post(URL_API + '/account', {
        access_token: this.accessToken
      }).then(res => {
        this.$nextTick(function () {
          $('#modal-acc').modal('hide')
        })
        this.loadAccounts()
      })
    },
    deleteAcc (accId, index) {
      axios.defaults.headers.common['Authorization'] = this.header
      let message = `Are you sure you will delete account?`
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
          axios.delete(URL_API + `/account/${accId}`).then(res => {
            this.accounts.splice(index, 1)
          }).catch(err => {
            console.log(err.response)
          })
        }
      })
    }
  }
}
</script>
