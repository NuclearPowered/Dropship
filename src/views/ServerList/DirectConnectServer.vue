<template>
  <div class="d-flex justify-content-center">
    <div class="bg-verydark mt-3 border border-white rounded" style="width: 500px">
      <h2 class="font-weight-bold py-3 text-center">Direct Connect</h2>
      <hr>
      <form class="px-5">
        <ValidationObserver v-slot="{ invalid }">
          <div class="form-group py-2">
            <ValidationProvider rules="required" v-slot="v">
              <input v-model="name" type="text" class="form-control" id="name" maxlength="20" placeholder="Name of server">
              <small class="form-text text-danger">{{ v.errors[0] }}</small>
            </ValidationProvider>
          </div>
          <div class="form-group py-2">
            <ValidationProvider rules="required" v-slot="v">
              <input v-model="ipAddress" type="text" class="form-control" id="ipAddress" maxlength="16" placeholder="IP Address/Domain of server">
              <small class="form-text text-danger">{{ v.errors[0] }}</small>
            </ValidationProvider>
          </div>
          <button class="btn btn-block my-3" :class="[btncolor]" @click.prevent="addServerButton()" :disabled="invalid">{{ btnmsg }}</button>
        </ValidationObserver>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ServerListService from '@/services/serverListService'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

@Component({
  components: { ValidationProvider, ValidationObserver }
})
export default class DirectConnectServer extends Vue {
  name = ''
  ipAddress = '';

  btncolor: 'btn-primary' | 'btn-danger' = 'btn-primary';
  btnmsg: 'Add Server' | 'Bad Server IP/Name' = 'Add Server';

  async addServerButton () {
    const ipAddrRegex = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\\.(?!$)|$)){4}$/
    if (ipAddrRegex.test(this.ipAddress)) {
      await this.addServer()
    } else {
      const lookup = await ServerListService.dnsQuery(this.ipAddress)
      if (lookup.err) {
        this.badAddServerButton()
      } else {
        this.ipAddress = lookup.address
        await this.addServer()
      }
    }
  }

  async addServer () {
    const success = await ServerListService.addServer(-1, this.name, ServerListService.dot2num(this.ipAddress), 22023)
    if (success) {
      this.$router.push('/serverlist/installed')
    }
  }

  badAddServerButton () {
    this.btncolor = 'btn-danger'
    this.btnmsg = 'Bad Server IP/Name'
    this.ipAddress = ''
    setTimeout(() => {
      this.btncolor = 'btn-primary'
      this.btnmsg = 'Add Server'
    }, 750)
  }
}
</script>
<style scoped lang="stylus">
</style>
