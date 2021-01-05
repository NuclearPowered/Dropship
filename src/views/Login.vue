<template>
  <div class="d-flex justify-content-center">
    <div class="bg-verydark mt-3 border border-white rounded" style="width: 500px">
      <h2 class="font-weight-bold py-3 text-center">Login</h2>
      <hr>
      <form class="px-5">
        <ValidationObserver v-slot="{ invalid }">
          <div class="form-group py-2">
            <ValidationProvider rules="alpha_num|required" v-slot="v">
              <input v-model="username" type="text" class="form-control" id="username" placeholder="Username/Email">
              <small class="form-text text-danger">{{ v.errors[0] }}</small>
            </ValidationProvider>
          </div>
          <div class="form-group py-2">
            <ValidationProvider rules="required" v-slot="v">
              <input v-model="password" type="password" class="form-control" id="password" placeholder="Password">
              <small class="form-text text-danger">{{ v.errors[0] }}</small>
            </ValidationProvider>
          </div>
          <div class="form-group form-check py-2">
            <input v-model="rememberMe" type="checkbox" class="form-check-input" id="rememberMe">
            <label class="form-check-label" for="rememberMe">Remember Me</label>
          </div>
          <button class="btn btn-block my-3" :class="[btncolor]" @click.prevent="login()" :disabled="invalid">{{ btnmsg }}</button>
        </ValidationObserver>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import AuthService from '@/services/authService'

@Component({
  components: { ValidationProvider, ValidationObserver }
})
export default class Login extends Vue {
  @Prop({ default: 'modlist' })
  redirectURL!: string;

  username = '';
  password = '';
  rememberMe = false;

  btncolor: 'btn-primary' | 'btn-warning' = 'btn-primary';
  btnmsg = 'Login';

  async login () {
    const response = await AuthService.login(this.username, this.password)
    if (response.success) {
      this.$store.state.firstLaunch ? this.$router.push('/firstLaunch') : this.$router.push(this.redirectURL)
    } else {
      this.badLoginButton(response.message)
    }
  }

  badLoginButton (message: string) {
    this.btncolor = 'btn-warning'
    this.btnmsg = message
    setTimeout(() => {
      this.btncolor = 'btn-primary'
      this.btnmsg = 'Login'
    }, 2000)
  }
}
</script>
<style scoped lang="stylus">
</style>
