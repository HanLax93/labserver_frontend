<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />
    <el-button class="add-button" icon="el-icon-plus" size="mini" type="primary" title="新增" @click="addThread()"
      v-if="$route.meta.keepAlive === 1 && permission === 1" />
    <el-button class="add-button" icon="el-icon-plus" size="mini" type="primary" title="新增" @click="addQuestion()"
      v-if="$route.meta.keepAlive === 2" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <el-tag style="cursor: pointer">
            {{ $store.getters.name }}
          </el-tag>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item> 主页 </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="changePassword">
            <span style="display: block">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dialog title="修改" :visible.sync="dialogVisible" width="40%">
        <el-form ref="dataForm" :model="user" label-width="100px" size="small" style="padding-right: 40px">
          <el-form-item label="密码" prop="password">
            <el-input v-model="user.password" type="password" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" icon="el-icon-refresh-right" @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" icon="el-icon-check" size="small" @click="update()">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog title="新增公告" :visible.sync="threadDialogVisible" width="30%">
        <el-form>
          <!-- 可见性编辑 -->
          <el-form-item label="仅管理员可见">
            <br>
            <el-switch v-model="announcement.forAdmin" active-color="#13ce66" inactive-color="#ff4949" :active-value="1"
              :inactive-value="0" />
          </el-form-item>
          <!-- 标题编辑 -->
          <el-form-item label="标题">
            <el-input v-model="announcement.title" />
          </el-form-item>
          <!-- 图片区域 -->
          <el-form-item label="图片">
            <br>
            <!-- 预览区域 -->
            <div class="image-container" v-if="announcementCachedImages.length !== 0"
              v-for="(cachedImage, cachedImageIndex) in announcementCachedImages" :key="cachedImageIndex">
              <el-image fit="cover" style="border-radius: 10px;" :src="cachedImage"
                :preview-src-list="announcementCachedImgsPreviewList" />
              <div class="close-button" @click="closeImage(announcementCachedImages, cachedImageIndex)">
                <i class="close-button-icon">×</i>
              </div>
            </div>
            <!-- 上传区域 -->
            <div class="upload-container">
              <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;">
              <div class="upload-button" @click="uploadImage()">
                <i class="upload-icon">+</i>
              </div>
            </div>
          </el-form-item>
          <!-- 内容编辑 -->
          <el-form-item label="内容">
            <el-input type="textarea" v-model="announcement.description" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" icon="el-icon-refresh-right" @click="cancelEditing()">取 消</el-button>
          <el-button type="primary" icon="el-icon-check" size="small" @click="save()">确
            定</el-button>
        </span>
      </el-dialog>

      <!-- 新增问题 -->
      <el-dialog title="新增问题" :visible.sync="QADialogVisible" width="30%">
        <el-form>
        <!-- 可见性编辑 -->
        <el-form-item v-if="permission == 1" label="仅管理员可见">
          <br>
          <el-switch v-model="question.forAdmin" active-color="#13ce66" inactive-color="#ff4949"
            :active-value="1" :inactive-value="0" />
        </el-form-item>
          <!-- 标题编辑 -->
          <el-form-item label="标题">
            <el-input v-model="question.title" />
          </el-form-item>
          <!-- 图片区域 -->
          <el-form-item label="图片">
            <br>
            <!-- 预览区域 -->
            <div class="image-container" v-if="questionCachedImages.length !== 0"
              v-for="(questionCachedImage, index) in questionCachedImages" :key="index">
              <el-image fit="cover" style="border-radius: 10px;" :src="questionCachedImage"
                :preview-src-list="questionCachedImgsPreviewList" />
              <div class="close-button" @click="closeQuestionImage(questionCachedImages, index)">
                <i class="close-button-icon">×</i>
              </div>
            </div>
            <!-- 上传区域 -->
            <div class="upload-container">
              <input type="file" ref="questionFileInput" @change="handleQuestionFileChange" style="display: none;">
              <div class="upload-button" @click="uploadQuestionImage()">
                <i class="upload-icon">+</i>
              </div>
            </div>
          </el-form-item>
          <!-- 内容编辑 -->
          <el-form-item label="内容">
            <el-input type="textarea" v-model="question.description" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" icon="el-icon-refresh-right" @click="cancelEditing()">取 消</el-button>
          <el-button type="primary" icon="el-icon-check" size="small" @click="saveQuestion()">确
            定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import { changepassword, getCurUser } from "@/api/user";
import bcrypt from "bcryptjs";
import api_1 from "@/api/help/help";

export default {
  data() {
    return {
      user: {},
      dialogVisible: false,
      threadDialogVisible: false,
      QADialogVisible: false,

      // 新增公告
      announcementImagePreview: null,
      announcementCachedImages: [],
      announcementCachedImgsPreviewList: [],
      emptyAnnouncement: {
        author: "",
        title: "",
        imgs: [],
        forAdmin: 0
      },
      announcement: {
        author: "",
        title: "",
        imgs: [],
        forAdmin: 0
      },

      // 新增问题
      questionImagePreview: null,
      questionCachedImages: [],
      questionCachedImagesPreviewList: [],
      question: {
        author: "",
        title: "",
        imgs: [],
        forAdmin: 0
      },
      permission: 0
    };
  },
  mounted() {
    this.permission = this.$store.state.user.permission
  },
  components: {
    Breadcrumb,
    Hamburger,
  },
  computed: {
    ...mapGetters(["sidebar", "avatar"]),
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    changePassword() {
      getCurUser().then((response) => {
        if (response.code === 20000) {
          this.user = response.data;
          this.dialogVisible = true;
        }
      });
    },
    async update() {
      this.user.passwordHash = bcrypt.hashSync(
        this.user.password,
        bcrypt.genSaltSync(10)
      );
      changepassword(this.user).then((response) => {
        if (response.code === 20000) {
          this.$message({
            message: "修改成功, 请重新登录",
            type: "success",
          });
          this.logout();
        }
      });
    },
    addThread() {
      this.threadDialogVisible = true;
    },
    addQuestion() {
      this.QADialogVisible = true;
    },
    base64ToBlob(base64) {
      const parts = base64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    },
    resolveImages(base64ImgsList) {
      const images = [];
      base64ImgsList.forEach((base64Img, index) => {
        const blob = this.base64ToBlob(base64Img);
        images.push(blob)
      })
      return images;
    },
    cancelEditing() {
      this.threadDialogVisible = false;
      this.announcementCachedImages = []
      this.announcement = this.emptyAnnouncement

      // 清除问题缓存
      this.QADialogVisible = false;
      this.questionCachedImages = []
      this.question = this.emptyAnnouncement;
    },
    save() {
      this.threadDialogVisible = false;
      api_1.updateAnnouncement(null, this.resolveImages(this.announcementCachedImages), this.announcement).then((res) => {
        if (res.code === 20000) {
          this.$message({
            message: res.msg,
            type: "success",
          });
          this.$router.go(0)
        } else {
          this.$message({
            message: res.msg,
            type: "error",
          });
        }
      });
      // 处理本地缓存
      this.announcementCachedImages = [];
      this.announcementCachedImgsPreviewList = [];
    },
    saveQuestion() {
      this.QADialogVisible = false;
      api_1.saveQuestion(this.resolveImages(this.questionCachedImages), this.question).then((res) => {
        if (res.code === 20000) {
          this.$message({
            message: res.msg,
            type: "success",
          });
          this.$router.go(0)
        } else {
          this.$message({
            message: res.msg,
            type: "error",
          });
        }
      });
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.previewImage();
    },
    previewImage() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.announcementImagePreview = e.target.result;
        this.announcementCachedImages.push(this.announcementImagePreview);
        this.announcementCachedImgsPreviewList = this.announcementCachedImages;
        this.$refs.fileInput.value = null;//vue中
      };
      reader.readAsDataURL(this.selectedFile);
    },
    uploadImage() {
      this.$refs.fileInput.click();
    },
    closeImage(imgsList, index) {
      this.$delete(imgsList, index);
    },
    handleQuestionFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.questionPreviewImage();
    },
    questionPreviewImage() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.questionImagePreview = e.target.result;
        this.questionCachedImages.push(this.questionImagePreview);
        this.questionCachedImgsPreviewList = this.questionCachedImages;
        this.$refs.questionFileInput.value = null;
      };
      reader.readAsDataURL(this.selectedFile);
    },
    uploadQuestionImage() {
      this.$refs.questionFileInput.click();
    },
    closeQuestionImage(imgsList, index) {
      this.$delete(imgsList, index);
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .add-button {
    float: left;
    margin-left: 20px;
    margin-top: 10px;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.collapse-image-container {
  height: 200px;
  width: 200px;
  position: relative;
  display: inline-flex;
  margin-right: 10px;
  margin-bottom: 10px;
}

.image-container,
.upload-container {
  height: 125px;
  width: 125px;
  position: relative;
  display: inline-flex;
  margin-right: 5px;
  margin-bottom: 5px;
}

.close-button {
  position: absolute;
  height: 16px;
  width: 16px;
  top: 3px;
  right: 3px;
  background: rgb(209, 115, 115);
  cursor: pointer;
  border: none;
  border-radius: 50%;
  font-weight: bold;
  justify-content: center;
}

.close-button-icon {
  position: absolute;
  top: -12px;
  right: 4px;
  color: white;
  cursor: pointer;
}

.upload-container {
  border: 2px dashed grey;
  text-align: center;
  justify-content: center;
  color: #409EFF;
  font-size: 1.5em;
  font-weight: bold;
  border-radius: 10px;
  top: 2px;
}

.upload-button {
  position: relative;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  border: 2px solid grey;
  justify-self: center;
  align-content: center;
  color: grey;
  cursor: pointer;
  top: 45px;
}

.upload-icon {
  cursor: pointer;
}
</style>
