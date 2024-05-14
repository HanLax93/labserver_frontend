<template>
  <div class="app-container">
    <el-collapse style="margin-left: 20px" v-model="activeName" accordion>
      <el-collapse-item v-for="(announcement, index) in announcements" :key="index">
        <template slot="title">
          <div style="font-size: 1.2em">
            {{ announcement.title }}
          </div>
          <i style="margin-left: 5px; color: grey; font-size: 1.2em" class="header-icon el-icon-user">{{
            announcement.author }}</i>
          <el-button style="margin: 10px 0 10px 10px" icon="el-icon-edit" size="mini" plain title="编辑"
            v-if="permission === 1" @click="editThread(announcement, index)" @click.stop.prevent="openCollapse" />
          <el-button style="margin: 10px 0 10px 10px" icon="el-icon-delete" size="mini" type="danger" title="删除"
            @click.stop.prevent="openCollapse()" @click="deleteThread(index)" v-if="permission === 1" />
        </template>
        <!-- 公告图片 -->
        <div class="collapse-image-container" v-show="checkImgs(announcement.imgs)"
          v-for="(img, index) in announcement.imgs">
          <el-image fit="cover" style="border-radius: 10px;" :src="resolveCollapseImg(img)"
            @error.once="setError()" v-bind:class="{ 'error-image-alt': errorImageContainer }"
            :preview-src-list="resolveCollapseImgList(announcement.imgs)"></el-image>
        </div>
        <div>
          {{ announcement.description }}
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- edit dialog -->
    <el-dialog title="编辑公告" :visible.sync="dialogVisible" width="30%">
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
          <div class="image-container" v-for="(img, index) in curAnnouncement.imgs" :key="index">
            <el-image @error.once="editSetError()" :class="{ 'edit-area-image-alt': editAreaErrorImageContainer }" fit="cover" style="border-radius: 10px;" :src="resolveEditingAreaImg(img)"
              :preview-src-list="imgsPreviewList" />
            <div class="close-button" @click="closeImage(curAnnouncement.imgs, index)">
              <i class="close-button-icon">×</i>
            </div>
          </div>
          <!-- 预览区域 -->
          <div class="image-container" v-if="cachedImages.length !== 0"
            v-for="(cachedImage, cachedImageIndex) in cachedImages" :key="cachedImageIndex">
            <el-image fit="cover" style="border-radius: 10px;" :src="cachedImage" :preview-src-list="imgsPreviewList" />
            <div class="close-button" @click="closeImage(cachedImages, cachedImageIndex)">
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
          <el-input type="textarea" v-model="curAnnouncement.description" />
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
      curAnnouncement: {},
      curAnnouncementIndex: -1,
      curAnnouncementBak: {},
      imgToBeRemoved: [],
      dialogVisible: false,
      selectedFile: null,
      imagePreview: {},
      cachedImages: [],
      oriImgsPreviewList: [],
      cachedImgsPreviewList: [],
      errorImageContainer: false,
      editAreaErrorImageContainer: false
    }
  },
  mounted() {
    this.permission = this.$store.state.user.permission;
    this.fetchData();
  },
  computed: {
    imgsPreviewList() {
      return [...this.oriImgsPreviewList, ...this.cachedImgsPreviewList];
    },
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
    resolveCollapseImg(img) {
      if (typeof img === "string") {
        return img;
      } else {
        // return img.filename;
        return "/images/" + img.filename;
      }
    },
    resolveCollapseImgList(imgs) {
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
    resolveEditingAreaImg(img) {
      if (typeof img === "string") {
        return img;
      } else {
        // return img.filename;
        return "/images/" + img.filename;
      }
    },
    resolveEditingAreaImgsList(imgs) {
      const imgsList = [];
      for (const img of imgs) {
        if (typeof img === "string") {
          imgsList.push(img);
        } else {
          // imgsList.push(img.filename);
          imgsList.push("/images/" + img.filename)
        }
      }
      return imgsList;
    },
    addThread() {
      this.dialogVisible = true;
    },
    editThread(announcement, index) {
      // 显示对话框
      this.dialogVisible = true
      this.curAnnouncement = { ...announcement };
      this.curAnnouncement.imgs = Object.values(announcement.imgs);
      this.curAnnouncement.imgs.forEach(item => {
        this.oriImgsPreviewList.push(this.resolveCollapseImg(item))
      });
      this.curAnnouncementIndex = index;
    },
    deleteThread(threadIndex) {
      const toBeRemovedThread = this.announcements[threadIndex];
      this.$delete(this.announcements, threadIndex);
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
    },
    closeImage(imgsList, index) {
      const removedImg = imgsList[index]
      this.$delete(imgsList, index);
      if (typeof removedImg !== 'string') {
        this.imgToBeRemoved.push(removedImg)
      }
    },
    cancelEditing() {
      this.dialogVisible = false;
      this.curAnnouncement = {};
      this.cachedImages = [];
      this.oriImgsPreviewList = [];
      this.cachedImgsPreviewList = [];
      this.imgsPreviewList = [];
      this.imgToBeRemoved = []
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
      this.curAnnouncementBak = { ...this.curAnnouncement, imgs: [] };
      // 后端更新公告
      api.updateAnnouncement(this.imgToBeRemoved, this.resolveImages(this.cachedImages), this.curAnnouncementBak).then((res) => {
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
      // 前端更新公告
      if (this.curAnnouncement.imgs !== null) {
        this.curAnnouncement.imgs = this.curAnnouncement.imgs.concat(this.cachedImages);
      } else {
        this.curAnnouncement.imgs = this.cachedImages;
      }
      console.log(this.curAnnouncement);
      this.announcements[curAnnouncementIndex] = { ...this.curAnnouncement, imgs: [...this.curAnnouncement.imgs] }
      // 处理本地缓存
      this.curAnnouncement = {};
      this.cachedImages = [];
      this.oriImgsPreviewList = [];
      this.cachedImgsPreviewList = [];
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.previewImage();
    },
    previewImage() {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
        this.cachedImages.push(this.imagePreview);
        this.cachedImgsPreviewList = this.cachedImages;
        this.$refs.fileInput.value = null;//vue中
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
}

.error-image-alt, .edit-area-image-alt {
    width: 200px;
    height: 200px;
    border: red 2px solid !important;
    border-radius: 10px;
}

.edit-area-image-alt {
  width: 125px;
  height: 125px;
}

.image-container,
.upload-container {
  position: relative;
  height: 125px;
  width: 125px;
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
  /* justify-self: center; */
  align-content: center;
  color: grey;
  cursor: pointer;
  top: 45px;
}

.upload-icon {
  cursor: pointer;
}
</style>