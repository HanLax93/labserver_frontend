<template>
  <div class="app-container" v-loading="listLoading">
    <el-table :data="list" fit highlight-current-row>
      <el-table-column label="名称" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="200">
        <template slot-scope="scope">
          {{ scope.row.isProcessed === 1 ? '已批准' : '未批准' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prob="create_at" align="center" width="250">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 3px;" />
          <span>{{ formatDate(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prob="update_at" align="center" width="250">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 3px;" />
          <span>{{ formatDate(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="margin" />
    </el-table>
  </div>
</template>

<script>
import api from '@/api/user/container/task'
import moment from 'moment'

export default {
  // 初始值
  data() {
    return {
      list: [],
      isLoading: false,
      listLoading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      api.tasks()
        .then(response => {
          if (response.code === 20000) {
            this.list = response.data
          } else {
            this.$message.error(response.msg)
          }
        })
        .then(() => {
          this.listLoading = false
        })
    },
    checkBtn(row) {
      return row.permission === 1
    },
    approve(name) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.isLoading = true
      api.approve(name)
        .then(response => {
          if (response.code === 20000) {
            this.$message.success('操作成功')
            this.$router.push({ path: '/system/containers' })
          } else {
            this.$message.error(response.msg)
          }
          loading.close()
        })
    },
    formatDate(rawDate) {
      return moment(rawDate).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
