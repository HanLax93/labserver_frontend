<template>
  <div class="container">
    <div :class="{ 'image-container': imageLoaded }" @load="handleImageLoaded">
      <el-image :class="{ 'image-with-border': imageLoaded }" :src="imageUrl" @load="handleImageLoaded">
        <div slot="error" class="image-slot">
          <i class="el-icon-more"></i>
        </div>
      </el-image>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      imageUrl: '',
      imageLoaded: false
    }
  },
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    this.fetchImage()
  },
  methods: {
    fetchImage() {
      const dogAccessKey = 'live_NNZUUKCt7P4AI7p9godWFAaAuXZOrfyIUS37OOG6EjSUsXjDFfakyCd6jDnjg0FB'
      const catAccessKey = 'live_6GwEE6UCMgjq7NZrzgbs9eRi85AC7VSQRvXrslRQqEBN2LwfgfYMut0e5xiqBmRN'
      const dogUrl = `https://api.thedogapi.com/v1/images/search?api_key=${dogAccessKey}`
      const catUrl = `https://api.thecatapi.com/v1/images/search?api_key=${catAccessKey}`
      const urls = [dogUrl, catUrl, dogUrl, catUrl, catUrl, dogUrl]
      var url = urls[Math.floor(Math.random() * urls.length)]

      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.imageUrl = data[0].url
        })
        .fetch(error => {
          console.error(error)
        })
    },
    handleImageLoaded() {
      this.imageLoaded = true
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.container {
  position: relative;
  height: 95vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  transform: rotate(5deg);
  display: inline-flex;
  /* 使用 inline-flex 来保持容器的大小仅足够包裹内容 */
  justify-content: center;
  align-items: center;
  border: 5px solid #555;
}

.image-with-border {
  display: block;
  /* 保持这个属性来去除图片下方的空白 */
  max-width: 100%;
  /* 如果需要，限制图片最大宽度 */
  height: 500px;
  /* 保持图片原有的宽高比 */
  max-height: 500px;
  /* 限制图片的最大高度 */
}
</style>
