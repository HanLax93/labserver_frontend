<template>
  <div class="login-container">
    <el-form ref="signupForm" :model="signupForm" :rules="signupRules" class="login-form" auto-complete="on"
      label-position="left">

      <div class="title-container">
        <h3 class="title">申请容器</h3>
      </div>

      <el-form-item prop="name">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="name" v-model="signupForm.name" placeholder="姓名" name="username" type="text" tabindex="1"
          auto-complete="on" />
      </el-form-item>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="username" v-model="signupForm.username" placeholder="用户名" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="entryYear">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="entryYear" v-model="signupForm.entryYear" placeholder="入学年份" name="entryYear" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;"
        @click="handleSignup()">Confirm</el-button>
    </el-form>
  </div>
</template>

<script>
import api from '@/api/user/container/signup'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length <= 3 && !/^[a-zA-Z].*/.test(value)) {
        callback(new Error('请输入格式正确的用户名，以字母开头并大于2位。例如：lax2021'))
      } else {
        callback()
      }
    }
    const validateEntryYear = (rule, value, callback) => {
      if (!/(?:(?:19|20)[0-9]{2})/.test(value)) {
        callback(new Error('请输入正确的年份'))
      } else {
        callback()
      }
    }
    return {
      signupForm: {},
      applyVo: {},
      signupRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        entryYear: [{ required: true, trigger: 'blur', validator: validateEntryYear }],
      },
      loading: false,
      alert: "登录密码：000000<br>请登录系统查看申请进度，查看帮助页面获取详细信息！"
    }
  },
  methods: {
    handleSignup() {
      this.$refs.signupForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.applyVo = {
            name: this.signupForm.name,
            username: this.signupForm.username,
            entryYear: this.signupForm.entryYear
          }
          api.signup(this.applyVo)
            .then(response => {
              this.loading = false
              if (response.code === 20000) {
                this.$alert(this.alert, '提示', {
                  confirmButtonText: '确定',
                  dangerouslyUseHTMLString: true,
                  callback: action => {
                    this.$router.push({ path: '/user/login' })
                  }
                })

              } else {
                this.$message({
                  message: response.msg,
                  type: 'error'
                })
              }
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}
</style>