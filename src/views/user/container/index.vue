<template>
  <div class="app-container" v-loading="listLoading">
    <el-table :data="list" fit highlight-current-row>
      <el-table-column align="center" label="容器id" width="150">
        <template slot-scope="scope">
          {{ scope.row.dockerID }}
        </template>
      </el-table-column>
      <el-table-column label="名称" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="端口" align="center">
        <template slot-scope="scope">
          <el-tag style="margin:0 0 0 5px;">
            <i>SSH:</i>
            {{ scope.row.ports[0] }}
          </el-tag>
          <el-tag type="success" style="margin:0 0 5px 5px;">
            <i>Jupyter:</i>
            {{ scope.row.ports[1] }}
          </el-tag>
          <el-tag type="warning" style="margin:0 0 5px 5px;">
            <i>Vnc:</i>
            {{ scope.row.ports[2] }}
          </el-tag>
          <el-tag type="info" style="margin:0 0 5px 5px;">
            <i>tensorboard:</i>
            {{ scope.row.ports[3] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prob="create_at" align="center" width="250">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 3px;" />
          <span>{{ formatDate(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="容器状态" width="110" align="center" prop="running">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.running" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
            :inactive-value="0" :disabled="scope.row.running === 1 || isLoading" @change="startRunning(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sshStatus" label="ssh状态" width="110">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.sshStatus" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
            :inactive-value="0" :disabled="scope.row.sshStatus === 1 || isLoadingSSH"
            @change="startRunningSSH(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="margin" />
    </el-table>
  </div>
</template>

<script>
import api from '@/api/user/container/container'
import moment from 'moment'

export default {
  // 初始值
  data() {
    return {
      list: [],
      listLoading: false,
      isLoading: false,
      isLoadingSSH: false
    }
  },
  created() {
    this.fetchData()
    this.listLoading = true
  },
  methods: {
    fetchData() {
      api.allContainers()
        .then(response => {
          this.listLoading = false
          if (response.code === 20000) {
            this.list = response.data
          } else {
            this.$message.error(response.msg)
          }
        })
    },
    checkBtn(row) {
      return row.permission === 1
    },
    startRunning(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.isLoading = true
      this.isLoadingSSH = true
      api.startRunning(row.name)
        .then(response => {
          this.isLoading = false
          this.isLoadingSSH = false
          if (response.code === 20000) {
            this.$message.success('操作成功')
          } else {
            this.$message.error(response.msg)
          }
          this.fetchData()
          loading.close()
        })
    },
    startRunningSSH(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.isLoadingSSH = true
      api.startRunningSSH(row.name)
        .then(response => {
          this.isLoadingSSH = false
          if (response.code === 20000) {
            this.$message.success('操作成功')
          } else {
            this.$message.error(response.msg)
          }
          loading.close()
          this.fetchData()
        })
    },
    formatDate(rawDate) {
      return moment(rawDate).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
