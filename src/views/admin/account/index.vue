<template>
  <div class="app-container" v-loading="listLoading">

    <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="关 键 字">
              <el-input v-model="searchObj.keyword" style="width: 95%" placeholder="用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间">
              <el-date-picker
                v-model="createTimes"
                type="datetimerange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="margin-right: 10px;width: 100%;"
                :default-time="['00:00:00', '23:59:59']"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="display:flex">
          <el-button type="primary" icon="el-icon-search" size="mini" :loading="loading" @click="fetchData()">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetData">重置</el-button>
        </el-row>
      </el-form>
    </div>

    <!-- 列表 -->
    <el-table
      :data="list"
      stripe
      style="width: 100%;margin-top: 10px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
      />
      <el-table-column
        label="序号"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名" width="150" prop="username">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名" width="150" prop="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="身份" width="150" align="center" prop="permission">
        <template slot-scope="scope">
          {{ scope.row.permission === 1 ? 'admin' : 'user' }}
        </template>
      </el-table-column>
      <el-table-column label="入学年份" width="150" align="center" prop="entryYear">
        <template slot-scope="scope">
          {{ scope.row.entryYear }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prob="create_at" align="center" width="250">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 3px;" />
          <span>{{ formatDate(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prob="update_at" align="center" width="250">
        <template slot-scope="scope">
          <i style="margin-right: 3px;" class="el-icon-time" />
          <span>{{ formatDate(scope.row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="修改用户" width="110" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" title="修改" @click="edit(scope.row.username)" />
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="删除用户" width="110">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" size="mini" title="删除" @click="deleteUser(scope.row.username)" :disabled="checkBtn(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="margin" />
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      style="padding: 30px 0; text-align: center;"
      layout="total, prev, pager, next, jumper"
      @current-change="fetchData"
    />

    <el-dialog title="修改" :visible.sync="dialogVisible" width="40%">
      <el-form ref="dataForm" :model="user" label-width="100px" size="small" style="padding-right: 40px;">
        <el-form-item label="密码" prop="password">
          <el-input v-model="user.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="permission">
          <el-switch v-model="user.permission" active-text="管理员" inactive-text="用户" :active-value="1" :inactive-value="0" :disabled="checkBtn(user)" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" icon="el-icon-refresh-right" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" icon="el-icon-check" size="small" @click="update()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/admin/account/user'
import bcrypt from 'bcryptjs'
import moment from 'moment'
// import { configure } from "nprogress"

export default {
  // 初始值
  data() {
    return {
      list: [],
      page: 1,
      limit: 3,
      total: 0,
      searchObj: {},
      user: {},
      createTimes: [],
      dialogVisible: false,
      dialogRoleVisible: false,
      selections: [],
      disabled: false,
      allRoles: [],
      userRoleIds: [],
      isIndeterminate: false,
      checkAll: false,
      assignedRoleVo: {},
      listLoading: false
    }
  },
  created() {
    this.fetchData()
    this.listLoading = true
  },
  methods: {
    fetchData(current = 1) {
      this.page = current
      console.log(this.createTimes)
      this.searchObj.createTimeBegin = this.createTimes[0]
      this.searchObj.createTimeEnd = this.createTimes[1]
      api.queryUserPage(this.page, this.limit, this.searchObj)
        .then(response => {
          this.listLoading = false
          if (response.code === 20000) {
            this.list = response.data.records
            this.total = response.data.total
          } else {
            this.$message.error(response.msg)
          }
        })
    },
    checkBtn(row) {
      return row.permission === 1
    },
    resetData() {
      this.searchObj = {}
      this.createTimes = []
      this.fetchData()
    },
    edit(username) {
      this.fetchDataByUsername(username)
      this.dialogVisible = true
    },
    fetchDataByUsername(username) {
      api.queryUserByUsername(username)
        .then(response => {
          if (response.code === 20000) {
            this.user = response.data
          } else {
            this.$message.error(response.msg)
          }
        })
    },
    update() {
      this.user.passwordHash = bcrypt.hashSync(this.user.password, bcrypt.genSaltSync(10))
      api.editUser(this.user)
        .then(response => {
          this.dialogVisible = false
          if (response.code === 20000) {
            this.$message.success(response.message || '修改成功')
            this.fetchData(this.page)
          } else {
            this.$message.error(response.msg)
          }
        })
    },
    deleteUser(username) {
      console.log(username)
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.deleteUser(username)
          .then(response => {
            if (response.code === 20000) {
              this.$message.success(response.message || '删除成功')
              this.fetchData(this.page)
            } else {
              this.$message.error(response.msg)
            }
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleSelectionChange(selection) {
      this.selections = selection
    },
    handleCheckAllChange(value) {
      this.userRoleIds = value ? this.allRoles.map(item => item.id) : []
      this.isIndeterminate = false
    },
    handleCheckedChange(value) {
      const { userRoleIds, allRoles } = this
      this.checkAll = userRoleIds.length === allRoles.length && userRoleIds.length > 0
      this.isIndeterminate = userRoleIds.length > 0 && userRoleIds < allRoles.length
    },
    formatDate(rawData) {
      return moment(rawData).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
