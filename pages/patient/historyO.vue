<template>
  <uni-notice-bar
  showIcon 
  scrollable
  text="报告将在检测完成后约30分钟生成，可以在收到系统通知后再来查询。"
/>
<view class="main">
<div class="big_box" v-for="(item, index) in dataList" :key="index">
  <div class="box_one">
    <div class="" style="font-weight: 700">{{ item.name || '' }}</div>
    <div>
      <span @click="handleReport(item)" style="color: #516bea; margin-right: 16px; cursor:pointer;">查看报告</span>
      <span @click="handleXml(item)" style="color: #e67e22; cursor:pointer;">查看XML</span>
    </div>
  </div>
  <div class="box_one other">
    <div class="">机构:{{ item.company || '' }}</div>
    <div class="">{{ item.time || '' }}</div>
  </div>
</div>
<view id="container"></view>
<button @click="handlePdf" class="btn">查看PDF</button>
</view>
</template>

<script>
import { getUserList, getUserPdf, getUserXml } from '@/api/patient.js';
import pdfWorker from 'pdfjs-dist/build/pdf.worker';
import axios from 'axios';
import getConfig from '@/utils/services/config.js';
import * as pdfjsViewer from 'pdfjs-dist/build/pdf';
// pdfjsViewer.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
import 'pdfjs-dist/web/pdf_viewer.css';
import * as PDF from 'pdfjs-dist';
window.pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry.js');
import uniNoticeBar from '@dcloudio/uni-ui/lib/uni-notice-bar/uni-notice-bar.vue'
import uniSection from '@dcloudio/uni-ui/lib/uni-section/uni-section.vue'

// const pdfjs = require("pdfjs-dist");
// pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry.js");

pdfjsViewer.GlobalWorkerOptions.workerSrc = pdfWorker;
// 获取配置
const config = getConfig();
export default {
name: '',
components: {
uniNoticeBar,
uniSection
},
data() {
return {
  pdfDoc: null,
  xmlString: '', 
  dataList: [
    {
      name: '张三',
      company: '测试医院',
      time: '2024-06-01',
    },
    {
      name: '李四',
      company: '健康体检中心',
      time: '2024-06-02',
    },
  ],
  form: {
    page_no: 1,
    page_size: 10,
  },
};
},
onLoad() {
this.getUserListFn();
},
onReachBottom() {
// 需要判是否还需要加载下一页数据
this.form.page_no++;
this.getUserListFnPage();
console.log('触底了');
},

methods: {
// 首次加载请求
getUserListFn() {
  getUserList(this.form).then(res => {
    this.dataList = res.results.data;
  });
},
// 下一页加载请求（增加是否还有数据的判断）
getUserListFnPage() {
  getUserList(this.form).then(res => {
    this.dataList = [...this.dataList, ...res.results.data];
  });
},
// 查询pdf
handlePdf() {
  this.dataList.push(...this.dataList);
  // getUserPdf({report_id:1}).then(res=>{
  // 	console.log(res,'999')
  // })
},

handleReport(row) {
    uni.navigateTo({
      url: '/pages/patient/pdf?report_id=' + row.report_id,
    });
    return;

  axios({
    method: 'get',
    url: `http://277fbfd6.cpolar.top/report/wechat-export/`,
    params: { report_id: row.report_id },
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
// handleXml(row) {
//   // 传递当前行的 report_id
//   const reportId = row.report_id;
//   getUserXml({ report_id: reportId }).then(res => {
//     console.log('XML接口返回内容:', res);
//     this.xmlValue = res
    
//   }).catch(err => {
//     console.error('获取XML失败:', err);
//   });
// },


// AI对话处理方法 - 整合了 Dify 功能
handleXml(row) {
  const reportId = row.report_id;
  getUserXml({ report_id: reportId }).then(res => {
    // 获取 XML 数据
    const xmlString = res.getString ? res.getString('xml') : res.xml;
    console.log('传递给 Dify 的 xml:', xmlString);
    
    // 这里可以添加XML数据的显示逻辑
    // uni.showModal({
    //   title: 'XML数据',
    //   content: JSON.stringify(res),
    //   showCancel: false
    // });
    
  }).catch(err => {
    console.error('获取XML失败:', err);
    uni.showToast({
      title: '获取XML失败',
      icon: 'error'
    });
  });
},
},
computed: {},
};
</script>
<style scoped lang="scss">
.main {
padding: 0 40rpx;
}
.big_box {
margin-bottom: 20rpx;
box-sizing: border-box;
border: 2px solid #ccc;
border-radius: 10rpx;
padding: 20rpx;
.box_one {
box-sizing: border-box;
width: 100%;
display: flex;
justify-content: space-between;
}
.other {
margin-top: 40rpx;
color: #999;
}
}
.btn {
margin-top: 40rpx;
}
.notice-fixed {
position: fixed;
top: 0;
left: 0;
width: 100vw;
z-index: 999;
}
.main {
padding-top: 0rpx; /* 根据通知栏高度适当调整 */
}
</style>
