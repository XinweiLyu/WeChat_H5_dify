<template>
  <div>
    <view id="container"></view>
  </div>
</template>

<script>
import getConfig from '/utils/services/config';
// 获取配置
const config = getConfig();
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';

// 一定要在 getDocument 之前设置 workerSrc
pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/pdf.worker.min.js';

export default {
  name: '',
  components: {},
  data() {
    return {
      userId: '',
    };
  },
  created() {
    this.userId = this.$route.query.report_id;
  },
  mounted() {
    this.$nextTick(() => {
      this.handleReport();
      this.$forceUpdate();
    });
  },
  methods: {
    async handleReport() {
      try {
        const response = await axios({
          method: 'get',
          url: `${config.baseURL}/report/wechat-export`,
          params: { report_id: this.userId },
          responseType: 'arraybuffer',
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
        // 新增：打印 getUserPdf 接口返回的数据
        console.log('getUserPdf 接口返回：', response.data);
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: '/static/cmaps/',
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        const container = document.getElementById('container');
        // 清空容器
        container.innerHTML = '';
        const scale = 1.5;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          container.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
          // 渲染文本层（可选）
          const textContent = await page.getTextContent();
          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'textLayer';
          container.appendChild(textLayerDiv);
          pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: [],
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
