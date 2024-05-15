<template>
  <div class="app-container">
    <el-collapse style="margin-left: 20px" accordion>
      <el-collapse-item v-for="(announcement, index) in announcements" :key="index">
        <div slot="title" class="collapse-title">
          <div style="font-size: 1.2em; display: inline-block;">
            {{ announcement.title }}
          </div>
          <i style="margin-left: 5px; color: grey; font-size: 1.2em" class="header-icon el-icon-user">{{
            announcement.author }}</i>
          <el-button style="margin: 10px 0 10px 10px" icon="el-icon-edit" size="mini" plain title="编辑"
            v-if="permission === 1" @click="editThread(announcement, index)" @click.stop.prevent="openCollapse" />
          <el-button style="margin: 10px 0 10px 10px" icon="el-icon-delete" size="mini" type="danger" title="删除"
            @click.stop.prevent="openCollapse()" @click="deleteThread(index)" v-if="permission === 1" />
        </div>
        <!-- 公告图片 -->
        <div class="collapse-image-container" v-show="checkImgs(announcement.imgs)"
          v-for="(img, index) in announcement.imgs">
          <el-image fit="cover" style="border-radius: 10px;" :src="resolveImage(img)" @error.once="setError()"
            v-bind:class="{ 'error-image-alt': errorImageContainer }"
            :preview-src-list="resolveImageList(announcement.imgs)">
            <div slot="error" class="image-slot">
              <i class="el-icon-loading collapse-error-icon"></i>
            </div>
          </el-image>
        </div>
        <v-md-editor class="description" :value="announcement.description" mode="preview"></v-md-editor>
      </el-collapse-item>
    </el-collapse>

    <!-- edit dialog -->
    <el-dialog title="编辑公告" :visible.sync="dialogVisible" width="45%" top="8vh" :before-close="closeDialog">
      <el-form>
        <!-- 可见性编辑 -->
        <el-form-item label="仅管理员可见">
          <br>
          <el-switch v-model="curAnnouncement.forAdmin" active-color="#13ce66" inactive-color="#ff4949"
            :active-value="1" :inactive-value="0" />
        </el-form-item>
        <!-- 标题编辑 -->
        <el-form-item label="标题">
          <el-input v-model="curAnnouncement.title" />
        </el-form-item>
        <!-- 图片区域 -->
        <el-form-item label="图片">
          <br>
          <!-- 公告图片 -->
          <div class="image-container" v-for="(img, index) in getCurAnnouncementImages" :key="index">
            <el-image @error.once="editSetError()" :class="{ 'edit-area-image-alt': editAreaErrorImageContainer }"
              fit="cover" style="border-radius: 10px;" :src="resolveImage(img)"
              :preview-src-list="resolveImageList(getCurAnnouncementImages)">
              <div slot="error" class="image-slot">
                <i class="el-icon-loading error-icon"></i>
              </div>
            </el-image>
            <div class="close-button" @click="closeImage(curAnnouncementImages, index)">
              <span class="close-button-icon">×</span>
            </div>
          </div>
          <!-- 上传区域 -->
          <div class="upload-container">
            <el-image class="upload-image">
              <!-- <i slot="error"></i> -->
              <div slot="error">
                <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;">
                <div slot="error">
                  <i class="upload-button" style="opacity: 0;">+</i>
                  <el-button class="upload-button" icon="el-icon-plus" circle @click="uploadImage()"></el-button>
                </div>
              </div>
            </el-image>
          </div>
        </el-form-item>
        <!-- 内容编辑 -->
        <!-- <el-form-item label="内容">
          <el-input type="textarea" v-model="curAnnouncement.description" />
        </el-form-item> -->

        <!-- 内容编辑 -->
        <el-form-item label="内容">
          <v-md-editor left-toolbar="undo redo clear | h bold italic strikethrough quote | link code | emoji"
            v-model="curAnnouncement.description" height="200px">
          </v-md-editor>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" icon="el-icon-refresh-right" @click="cancelEditing()">取 消</el-button>
        <el-button type="primary" icon="el-icon-check" size="small" @click="update(curAnnouncementIndex)">确
          定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "@/api/help/help";

export default {
  data() {
    return {
      announcements: [],
      permission: 0,
      dialogVisible: false,
      errorImageContainer: false,
      editAreaErrorImageContainer: false,
      test: '',

      // 编辑公告
      selectedFile: null,
      imagePreview: {},
      curAnnouncement: {},
      curAnnouncementIndex: -1,
      curAnnouncementImages: [],
      curAnnouncementOldImages: [],
      curAnnouncementAddedImages: [],
      imagesToBeRemoved: []
    }
  },
  created() {
  },
  mounted() {
    this.permission = this.$store.state.user.permission;
    this.fetchData();
  },
  computed: {
    getCurAnnouncementImages() {
      this.curAnnouncementImages = [...this.curAnnouncementOldImages, ...this.curAnnouncementAddedImages];
      return this.curAnnouncementImages;
    }
  },
  methods: {
    fetchData() {
      api.getAnnouncement().then((res) => {
        this.announcements = res.data;
      });
    },
    checkImgs(imgs) {
      return imgs === null ? false : true;
    },
    resolveImage(img) {
      if (typeof img === "string") {
        return img;
      } else {
        // return img.filename;
        return "/images/" + img.filename;
      }
    },
    resolveImageList(imgs) {
      const imgsList = [];
      for (const img of imgs) {
        if (typeof img === "string") {
          imgsList.push(img)
        } else {
          // imgsList.push(img.filename);
          imgsList.push("/images/" + img.filename)
        }
      }
      return imgsList
    },
    addThread() {
      this.dialogVisible = true;
    },
    editThread(announcement, index) {
      this.curAnnouncementAddedImages = []
      this.imagesToBeRemoved = []
      // 显示对话框
      this.dialogVisible = true
      this.curAnnouncement = { ...announcement };
      if (announcement.imgs !== null) {
        this.curAnnouncementOldImages = Object.values(announcement.imgs)
      } else {
        this.curAnnouncementOldImages = []
      }
      this.curAnnouncementIndex = index
    },
    deleteThread(threadIndex) {
      this.$confirm("此操作将永久删除该公告, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const toBeRemovedThread = this.announcements[threadIndex];
        this.$delete(this.announcements, threadIndex);
        toBeRemovedThread.imgs = []
        api.deleteThread(toBeRemovedThread).then((res) => {
          if (res.code === 20000) {
            this.$message({
              message: res.msg,
              type: "success",
            });
          } else {
            this.$message({
              message: res.msg,
              type: "error",
            });
          }
        });
      }).catch(() => {
        this.$message.info("已取消删除");
      });
    },
    closeImage(imgsList, index) {
      const removedImg = imgsList[index]
      const closedImage = this.curAnnouncementImages[index];
      const indexInCurAnnouncementOldImages = this.curAnnouncementOldImages.indexOf(closedImage);
      if (indexInCurAnnouncementOldImages !== -1) {
        this.$delete(this.curAnnouncementOldImages, indexInCurAnnouncementOldImages)
      } else {
        const indexInCurAnnouncementAddedImages = this.curAnnouncementAddedImages.indexOf(closedImage);
        this.$delete(this.curAnnouncementAddedImages, indexInCurAnnouncementAddedImages)
      }
      this.$delete(imgsList, index);
      if (typeof removedImg !== 'string') {
        this.imagesToBeRemoved.push(removedImg)
      }
    },
    cancelEditing() {
      this.dialogVisible = false
      this.imagesToBeRemoved = [],
        this.curAnnouncementAddedImages = []
    },
    closeDialog() {
      const imagesPreviewExists = document.getElementsByClassName('el-image-viewer__wrapper')[0];
      if (!imagesPreviewExists) {
        this.dialogVisible = false
      }
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
    update(curAnnouncementIndex) {
      this.dialogVisible = false;
      const toBeUpdatedAnnouncement = { ...this.curAnnouncement, imgs: [] };
      // 后端更新公告
      api.updateAnnouncement(this.imagesToBeRemoved, this.resolveImages(this.curAnnouncementAddedImages), toBeUpdatedAnnouncement).then((res) => {
        if (res.code === 20000) {
          this.$message({
            message: res.msg,
            type: "success",
          });
        } else {
          this.$message({
            message: res.msg,
            type: "error",
          });
        }
        this.imagesToBeRemoved = [];
      });
      // 前端更新公告
      this.announcements[curAnnouncementIndex] = { ...this.curAnnouncement, imgs: [...this.curAnnouncementImages] }
      // 处理本地缓存
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.previewImage();
    },
    previewImage() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
        this.curAnnouncementAddedImages.push(this.imagePreview)
        this.$refs.fileInput.value = null;
      };
      reader.readAsDataURL(this.selectedFile);
    },
    uploadImage() {
      this.$refs.fileInput.click();
    },
    openCollapse() {
    },
    setError() {
      this.errorImageContainer = true;
    },
    editSetError() {
      this.editAreaErrorImageContainer = true;
    }
  }
}
</script>

<style scoped>
::v-deep .collapse-title {
  flex: 1 0 90%;
  order: 1;

  .el-collapse-item__header {
    flex: 1 0 auto;
    order: -1;
  }
}

::v-deep .el-collapse-item, ::v-deep .el-form-item {
    .el-collapse-item__content {
        padding-bottom: 0;
    }

    .el-image-viewer__canvas img {
        max-height: 80% !important;
        max-width: 80% !important;
    }
}

.add-icon {
  position: absolute;
  top: -20px;
  z-index: 10000 !important;
}

.collapse-image-container {
  height: 200px;
  width: 200px;
  position: relative;
  display: inline-flex;
  margin-right: 10px;
  margin-bottom: 10px;
  border: grey 2px solid;
  border-radius: 10px;
}

.error-image-alt,
.edit-area-image-alt {
  width: 200px;
  height: 200px;
  border: red 2px solid !important;
  border-radius: 10px;
}

.edit-area-image-alt {
  width: 125px;
  height: 125px;
}

.image-container {
  position: relative;
  height: 125px;
  width: 125px;
  display: inline-flex;
  margin-right: 5px;
  margin-bottom: 5px;
  border: grey 2px solid;
  border-radius: 10px;
}

.collapse-error-icon {
  position: relative;
  top: 90px;
  left: 90px;
}

.error-icon {
  position: relative;
  top: 40px;
  left: 52px;

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

.upload-container {
  position: relative;
  height: 125px;
  width: 125px;
  display: inline-flex;
  margin-right: 5px;
  margin-bottom: 5px;
  border: 2px dashed grey;
  border-radius: 10px;
}

.upload-button {
  width: 40px;
  height: 40px;
  border: solid 2px darkgray;
  margin-left: 40px;
}

.close-button-icon {
  position: absolute;
  top: -12px;
  right: 4px;
  color: white;
  cursor: pointer;
}

::v-deep .description {
  .vuepress-markdown-body {
    padding: 10px 40px 10px 0;
  }
}
</style>