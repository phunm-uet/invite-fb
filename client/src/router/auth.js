import Login from '../components/Login.vue'
const authRouter = (to, from, next) => {
  let token = localStorage.getItem('token')
  if (!token) next(Login)
  next()
}

const redirectRouter = (to, from, next) => {
  // let token = localStorage.getItem('token')
  next()
}
export {authRouter, redirectRouter}
