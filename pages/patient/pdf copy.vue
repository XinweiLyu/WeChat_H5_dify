<template>
  <div>
    <view id="container"></view>
  </div>
</template>

<script>
import { getUserList, getUserPdf } from '@/api/patient.js';
//import pdfWorker from 'pdfjs-dist/build/pdf.worker';
import axios from 'axios';
import getConfig from '@/utils/services/config.js';
import * as pdfjsViewer from 'pdfjs-dist/build/pdf';
import * as PDF from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
window.pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry.js');
pdfjsViewer.GlobalWorkerOptions.workerSrc = pdfWorker;
//pdfjsViewer.GlobalWorkerOptions.workerSrc = '/static/pdf.worker.min.js';



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
    handleReport() {
      axios({
        method: 'get',
        url: `http://277fbfd6.cpolar.top/report/wechat-export/`,
        params: { report_id: this.userId },
        responseType: 'arraybuffer',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      })
        .then(async response => {
          const blob = new Blob([response.data], {
            type: 'application/pdf',
          });
          var url = URL.createObjectURL(blob);
          const loadingTask = pdfjsViewer.getDocument({
            url,

            cMapUrl: '/public/cmaps/',
            // TODO pro env
            // cMapUrl: '/cmaps/',
            cMapPacked: true,
          });
          const temp = await pdfjsViewer.getDocument(url).promise;

          const renderPdf = pageNum => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const scale = 1.5;
            loadingTask.promise.then(pdf => {
              pdf.getPage(pageNum).then(page => {
                const viewport = page.getViewport({ scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                  canvasContext: context,
                  viewport: viewport,
                };
                const renderTask = page.render(renderContext);
              });
            });
            const container = document.getElementById('container');
            container.appendChild(canvas);
            loadingTask.promise.then(pdf => {
              pdf.getPage(pageNum).then(page => {
                const textlayer = document.createElement('div');
                textlayer.className = 'textLayer';
                container.appendChild(textlayer);
                const viewport = page.getViewport({ scale });
                page
                  .getTextContent()
                  .then(textContent => {
                    const textlayer = document.createElement('div');
                    textlayer.className = 'textLayer';
                    container.appendChild(textlayer);

                    pdfjsViewer.renderTextLayer({
                      textContentSource: textContent,
                      container: textlayer,
                      viewport: viewport,
                      textDivs: [],
                    });
                  })
                  .catch(error => {
                    // console.error('Failed to retrieve text content:', error);
                    // 这里可以添加额外的错误处理逻辑，比如显示一个错误消息给用户
                  });
              });
            });
          };

          for (let i = 1; i <= temp.numPages; i++) {
            renderPdf(i);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
