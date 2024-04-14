<template>
  <div class="app-container" v-loading="listLoading">
    <el-table :data="list" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column label="名称" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="200">
        <template slot-scope="scope">
          {{ checkTaskStatus(scope.row.isProcessed) }}
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
      <el-table-column class-name="status-col" label="批准" width="110" align="center">
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-check" size="mini" title="批准" @click="approve(scope.row)"
            :disabled="scope.row.isProcessed != 0 || isLoading || scope.row.processed" />
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="拒绝" width="110" align="center">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-close" size="mini" title="拒绝" @click="decline(scope.row)"
            :disabled="scope.row.isProcessed != 0 || isLoading || scope.row.processed" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="margin" />
    </el-table>
  </div>
</template>

<script>
import api from '@/api/admin/container/task'
import moment from 'moment'

export default {
  // 初始值
  data() {
    return {
      list: [],
      isLoading: false,
      listLoading: false,
    }
  },
  created() {
    this.fetchData()
    this.listLoading = true
  },
  methods: {
    fetchData() {
      api.tasks()
        .then(response => {
          if (response.code === 20000) {
            this.list = response.data
          } else {
            this.$message.error(response.msg)
          }
          this.listLoading = false
        })
    },
    checkBtn(row) {
      return row.permission === 1
    },
    checkTaskStatus(stautsNum) {
      if (stautsNum === 0) {
        return '未处理'
      } else if (stautsNum === 1) {
        return '已批准'
      } else {
        return '已拒绝'
      }
    },
    formatDate(rawDate) {
      return moment(rawDate).format('YYYY-MM-DD HH:mm:ss')
    },
    approve(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.isLoading = true
      api.approve(row.name)
        .then(response => {
          loading.close()
          this.isLoading = false
          if (response.code === 20000) {
            this.$message.success('操作成功')
            this.$router.push({ path: '/system/containers' })
          } else {
            this.$message.error(response.msg)
            row.isProcessed = 0
          }
        })
    },
    decline(row) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.isLoading = true
      api.decline(row.name)
        .then(response => {
          this.isLoading = false
          loading.close()
          if (response.code === 20000) {
            row.processed = true
            this.$alert('操作成功，通知用户更换用户名重新申请', '提示', {
              confirmButtonText: '确定',
              callback: action => {
              }
            })
          } else {
            this.$message.error(response.msg)
            scope.isProcessed = 0
          }
        })
    }
  }
}
</script>
