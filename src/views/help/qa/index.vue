<template>
    <div class="app-container">
        <el-collapse style="margin-left: 20px" accordion>
            <el-collapse-item v-for="(question, index) in questions" :key="index">
                <span class="collapse-title" slot="title">
                    <div style="font-size: 1.2em; display: inline-block;">
                        {{ question.title }}
                    </div>
                    <i style="margin-left: 5px; color: grey; font-size: 1.2em" class="header-icon el-icon-user">{{
                        question.author }}</i>
                    <el-button style="margin: 10px 0 10px 10px;" icon="el-icon-chat-line-round" size="mini"
                        type="primary" title="回答" v-if="permission === 1" @click.stop.prevent="openCollapse()"
                        @click="editQuestion(question, index)" />
                    <el-button style="margin: 10px 0 10px 10px" icon="el-icon-delete" size="mini" type="danger"
                        title="删除" @click.stop.prevent="openCollapse()" @click="deleteQuestion(index)"
                        v-if="permission === 1" />
                </span>
                <!-- 问题图片 -->
                <div class="collapse-image-container" v-show="question.imgs !== null"
                    v-for="(img, index) in question.imgs">
                    <el-image fit="cover" style="border-radius: 10px;" :src="resolveImage(img)"
                        :preview-src-list="resolveImageList(question.imgs)" @error.once="setQuestionImageErr()"
                        v-bind:class="{ 'error-image-alt': questionImageError }">
                        <div slot="error" class="image-slot">
                            <i class="el-icon-loading collapse-error-icon"></i>
                        </div>
                    </el-image>
                </div>
                <v-md-editor class="description" :value="question.description" mode="preview"></v-md-editor>
                <el-collapse v-if="question.ansDescription !== null">
                    <el-collapse-item>
                        <div slot="title" class="collapse-title">
                            <div style="font-size: 1.2em; color: gray; display: inline-block;">
                                回答
                            </div>
                        </div>
                        <div class="collapse-image-container" v-show="question.ansImgs !== null"
                            v-for="(img, index) in question.ansImgs">
                            <el-image fit="cover" style="border-radius: 10px;" :src="resolveImage(img)"
                                :preview-src-list="resolveImageList(question.ansImgs)" @error.once="setAnswerImageErr()"
                                v-bind:class="{ 'error-image-alt': answerImageError }">
                                <div slot="error" class="image-slot">
                                    <i class="el-icon-loading collapse-error-icon"></i>
                                </div>
                            </el-image>
                        </div>
                        <v-md-editor class="description" :value="question.ansDescription" mode="preview"></v-md-editor>
                    </el-collapse-item>
                </el-collapse>
            </el-collapse-item>
        </el-collapse>

        <!-- edit dialog -->
        <el-dialog title="编辑问题" :visible.sync="dialogVisible" width="45%" top="8vh" :before-close="closeDialog">
            <el-collapse>
                <!-- 问题 -->
                <el-collapse-item>
                    <div class="collapse-title" slot="title">
                        问题
                    </div>
                    <el-form>
                        <!-- 标题 -->
                        <el-form-item label="标题">
                            <!-- <el-input v-model="curQuestion.title" /> -->
                            <br>
                            {{ curQuestion.title }}
                        </el-form-item>

                        <!-- 图片区域 -->
                        <el-form-item v-if="getCurQuestionImages.length !== 0" label="图片">
                            <br>

                            <!-- 公告图片 -->
                            <div class="image-container" v-for="(img, index) in getCurQuestionImages" :key="index">
                                <el-image @error.once="setCurQuestionImageErr()"
                                    :class="{ 'edit-area-image-alt': curQuestionImageError }" fit="cover"
                                    style="border-radius: 10px;" :src="resolveImage(img)"
                                    :preview-src-list="resolveImageList(getCurQuestionImages)">
                                    <div slot="error" class="image-slot">
                                        <i class="el-icon-loading error-icon"></i>
                                    </div>
                                </el-image>
                            </div>

                            <!-- 上传区域 -->
                            <!-- <div class="upload-container">
                                <el-image class="upload-image">
                                    <div slot="error">
                                        <input type="file" ref="questionFileInput" @change="handleQuestionFileChange"
                                            style="display: none;">
                                        <div slot="error">
                                            <i class="upload-button" style="opacity: 0;">+</i>
                                            <el-button class="upload-button" icon="el-icon-plus" circle
                                                @click="uploadQuestionImage()"></el-button>
                                        </div>
                                    </div>
                                </el-image>
                            </div> -->
                        </el-form-item>
                        <!-- 内容编辑 -->
                        <el-form-item label="问题描述">
                            <v-md-editor class="description" :value="curQuestion.description"
                                mode="preview"></v-md-editor>
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
            </el-collapse>

            <!-- 回答 -->
            <el-collapse>
                <el-collapse-item title="回答">
                    <div class="collapse-title" slot="title">
                        回答
                    </div>
                    <el-form>
                        <!-- 图片区域 -->
                        <el-form-item label="图片">
                            <br>
                            <!-- 回答图片 -->
                            <div class="image-container" v-for="(img, index) in getCurAnswerImages" :key="index">
                                <el-image @error.once="setCurAnswerImageErr()"
                                    :class="{ 'edit-area-image-alt': curAnswerImageError }" fit="cover"
                                    style="border-radius: 10px;" :src="resolveImage(img)"
                                    :preview-src-list="resolveImageList(getCurAnswerImages)">
                                    <div slot="error" class="image-slot">
                                        <i class="el-icon-loading error-icon"></i>
                                    </div>
                                </el-image>
                                <div class="close-button" @click="closeAnswerImage(curAnswerImages, index)">
                                    <span class="close-button-icon">×</span>
                                </div>
                            </div>
                            <!-- 上传区域 -->
                            <div class="upload-container">
                                <el-image class="upload-image">
                                    <!-- <i slot="error"></i> -->
                                    <div slot="error">
                                        <input type="file" ref="answerFileInput" @change="handleAnswerFileChange"
                                            style="display: none;">
                                        <div slot="error">
                                            <i class="upload-button" style="opacity: 0;">+</i>
                                            <el-button class="upload-button" icon="el-icon-plus" circle
                                                @click="uploadAnswerImage()"></el-button>
                                        </div>
                                    </div>
                                </el-image>
                            </div>
                        </el-form-item>
                        <!-- 答案编辑 -->
                        <el-form-item label="回答">
                            <v-md-editor
                                left-toolbar="undo redo clear | h bold italic strikethrough quote | link code | emoji"
                                v-model="curQuestion.ansDescription" height="200px">
                            </v-md-editor>
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
            </el-collapse>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" icon="el-icon-refresh-right" @click="cancelEditing()">取 消</el-button>
                <el-button type="primary" icon="el-icon-check" size="small"
                    @click="update(curQuestionIndex)">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/api/help/help';

export default {
    data() {
        return {
            questions: [],
            permission: 0,
            errorImageContainer: false,
            dialogVisible: false,
            questionImageError: false,
            answerImageError: false,
            curQuestionImageError: false,
            curAnswerImageError: false,

            // 编辑问题
            selectedFile: null,
            questionImagePreview: {},
            answerImagePreview: {},
            curQuestion: {},
            curQuestionIndex: -1,
            curQuestionImages: [],
            curQuestionOldImages: [],
            curQuestionAddedImages: [],
            questionImagesToBeRemoved: [],
            curAnswerImages: [],
            curAnswerOldImages: [],
            curAnswerAddedImages: [],
            answerImagesToBeRemoved: []
        };
    },
    computed: {
        getCurQuestionImages() {
            this.curQuestionImages = [...this.curQuestionOldImages, ...this.curQuestionAddedImages];
            return this.curQuestionImages;
        },
        getCurAnswerImages() {
            this.curAnswerImages = [...this.curAnswerOldImages, ...this.curAnswerAddedImages];
            return this.curAnswerImages;
        }
    },
    mounted() {
        this.getQuestions();
        this.permission = this.$store.state.user.permission;
    },
    methods: {
        openCollapse() { },
        // unloaded images style setting
        setQuestionImageErr() {
            this.questionImageError = true;
        },
        setAnswerImageErr() {
            this.answerImageError = true;
        },
        setCurQuestionImageErr() {
            this.curQuestionImageError = true;
        },
        setCurAnswerImageErr() {
            this.curAnswerImageError = true;
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
                    imgsList.push(img);
                } else {
                    // imgsList.push(img.filename);
                    imgsList.push("/images/" + img.filename)
                }
            }
            return imgsList;
        },
        getQuestions() {
            api.getQuestion().then(res => {
                if (res.code === 20000) {
                    this.questions = res.data;
                } else {
                    this.$message.error(res.msg);
                }
            });
        },
        resolveCollapseImg(img) {
            if (typeof img === "string") {
                return img;
            } else {
                // return img.filename;
                return "/images/" + img.filename;
            }
        },
        editQuestion(question, index) {
            this.curAnswerAddedImages = []
            this.answerImagesToBeRemoved = []

            this.dialogVisible = true;
            this.curQuestion = { ...question };
            if (this.curQuestion.ansDescription === null) {
                this.curQuestion.ansDescription = ''
            }
            if (question.imgs !== null) {
                this.curQuestionOldImages = Object.values(question.imgs)
            } else {
                this.curQuestionOldImages = []
            }
            this.curQuestionIndex = index
            if (question.ansImgs !== null) {
                this.curAnswerOldImages = Object.values(question.ansImgs)
            } else {
                this.curAnswerOldImages = []
            }
        },
        handleQuestionFileChange(event) {
            this.selectedFile = event.target.files[0];
            this.previewQuestionImage();
        },
        previewQuestionImage() {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.questionImagePreview = e.target.result;
                this.curQuestionAddedImages.push(this.questionImagePreview)
                this.$refs.questionFileInput.value = null;
            };
            reader.readAsDataURL(this.selectedFile);
        },
        uploadQuestionImage() {
            this.$refs.questionFileInput.click();
        },
        handleAnswerFileChange(event) {
            this.selectedFile = event.target.files[0];
            this.previewAnswerImage();
        },
        previewAnswerImage() {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.answerImagePreview = e.target.result;
                this.curAnswerAddedImages.push(this.answerImagePreview)
                this.$refs.answerFileInput.value = null;
            };
            reader.readAsDataURL(this.selectedFile);
        },
        uploadAnswerImage() {
            this.$refs.answerFileInput.click();
        },
        /*
        closeQuestionImage(imgsList, index) {
            const removedImg = imgsList[index]
            const closedImage = this.curQuestionImages[index];
            const indexInCurQuestionOldImages = this.curQuestionOldImages.indexOf(closedImage);
            if (indexInCurQuestionOldImages !== -1) {
                this.$delete(this.curQuestionOldImages, indexInCurQuestionOldImages)
            } else {
                const indexInCurQuestionAddedImages = this.curQuestionAddedImages.indexOf(closedImage);
                this.$delete(this.curQuestionAddedImages, indexInCurQuestionAddedImages)
            }
            this.$delete(imgsList, index);
            if (typeof removedImg !== 'string') {
                this.questionImagesToBeRemoved.push(removedImg)
            }
        },
        */
        closeAnswerImage(imgsList, index) {
            const removedImg = imgsList[index]
            const closedImage = this.curAnswerImages[index];
            const indexInCurAnswerOldImages = this.curAnswerOldImages.indexOf(closedImage);
            if (indexInCurAnswerOldImages !== -1) {
                this.$delete(this.curAnswerOldImages, indexInCurAnswerOldImages)
            } else {
                const indexInCurAnswerAddedImages = this.curAnswerAddedImages.indexOf(closedImage);
                this.$delete(this.curAnswerAddedImages, indexInCurAnswerAddedImages)
            }
            this.$delete(imgsList, index);
            if (typeof removedImg !== 'string') {
                this.answerImagesToBeRemoved.push(removedImg)
            }
        },
        cancelEditing() {
            this.dialogVisible = false
            this.questionImagesToBeRemoved = [],
                this.answerImagesToBeRemoved = []
            this.curQuestionAddedImage = [],
                this.curAnswerAddedImages = []
        },
        closeDialog() {
            const imagesPreviewExists = document.getElementsByClassName('el-image-viewer__wrapper')[0];
            const fullScreenVmEditor = document.getElementsByClassName('v-md-editor--fullscreen')[0];
            if (!imagesPreviewExists && !fullScreenVmEditor) {
                this.dialogVisible = false
            }
        },
        update(questionIndex) {
            this.dialogVisible = false;
            const toBeUpdatedQuestion = { ...this.curQuestion, imgs: [], ansImgs: [] };
            // 后端更新公告
            api.updateQuestion(this.questionImagesToBeRemoved, this.answerImagesToBeRemoved, this.resolveImages(this.curQuestionAddedImages), this.resolveImages(this.curAnswerAddedImages), toBeUpdatedQuestion).then((res) => {
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
            this.questions[questionIndex] = { ...this.curQuestion, imgs: [...this.curQuestionImages], ansImgs: [...this.curAnswerImages] }
            // 处理本地缓存
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
        deleteQuestion(index) {
            this.$confirm("此操作将永久删除该问题, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const toBeRemovedThread = this.questions[index];
                this.$delete(this.questions, index);
                toBeRemovedThread.imgs = []
                toBeRemovedThread.ansImgs = []
                api.removeQuestion(toBeRemovedThread).then((res) => {
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
    }
}
</script>

<style lang="scss" scoped>
::v-deep .collapse-title {
    flex: 1 0 90%;
    order: 1;

    .el-collapse-item__header {
        flex: 1 0 auto;
        order: -1;
    }
}

::v-deep .el-collapse-item {
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