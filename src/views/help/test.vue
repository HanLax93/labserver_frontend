<template>
  <div>
    <input type="file" multiple @change="handleFilesChange">
    <div v-for="(preview, index) in imagePreviews" :key="index" class="preview">
      <img :src="preview" alt="Preview" style="width: 100px; height: auto;">
    </div>
    <button @click="uploadImages">Upload Images</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFiles: [],
      imagePreviews: []
    };
  },
  methods: {
    handleFilesChange(event) {
      this.selectedFiles = Array.from(event.target.files);
      this.imagePreviews = this.selectedFiles.map(file => {
        return URL.createObjectURL(file);
      });
    },
    uploadImages() {
      if (!this.selectedFiles.length) {
        alert('No images selected');
        return;
      }

      const formData = new FormData();
      this.selectedFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      // Replace 'your-upload-url' with your actual upload URL
      fetch('your-upload-url', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // Clear previews and selected files after upload
        this.imagePreviews = [];
        this.selectedFiles = [];
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }
}
</script>

<style>
.preview img {
  margin: 5px;
}
</style>
