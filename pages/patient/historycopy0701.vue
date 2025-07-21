<template>
  <uni-notice-bar
    showIcon
    scrollable
    text="报告将在检测完成后约30分钟生成，可以在收到系统通知后再来查询。"
  />
  
  <view class="main">
    <div class="big_box" v-for="(item, index) in dataList" :key="index">
      <!-- 报告异常标签，右上角 -->
      <div v-if="!item.report_status" class="report-reject-corner">报告异常</div>
      <div class="box_one">
        <div class="" style="font-weight: 700">{{ item.name || '' }}</div>
        <div class=""></div>
      </div>
      <div class="box_one other">
        <div class="">机构:{{ item.company || '' }}</div>
        <div class="">{{ item.time || '' }}</div>
      </div>
      <!-- 按钮区域，底部一行横向排列 -->
      <div class="card-actions">
        <span
          @click="handleDownload(item)"
          class="action-btn download"
        >报告下载</span>
        <span
          @click="handleReport(item)"
          class="action-btn view"
        >查看报告</span>
        <span
          @click="handleXml(item)"
          class="action-btn ai"
        >AI对话</span>
      </div>
    </div>
    <view id="container"></view>
    <!-- <button @click="handlePdf" class="btn">查看PDF</button> -->

    <!-- Dify聊天机器人界面 -->
    <div v-if="showChatInterface && !isMinimized" class="iframe-container">
      <div class="chat-header">
        <h3>AI分析报告 - {{ currentPatientName }}</h3>
        <div class="chat-controls">
          <button @click="minimizeChat" class="minimize-btn" title="最小化">
            <span>─</span>
          </button>
          <button @click="closeChatInterface" class="close-btn" title="关闭">
            <span>×</span>
          </button>
        </div>
      </div>
      <iframe
        :key="iframeKey"
        :src="iframeSrc"
        style="width: 100%; height: 100%; min-height: 700px"
        frameborder="0"
        allow="microphone"
        ref="chatIframe"
      >
      </iframe>
    </div>

    <!-- 最小化后的点开按钮 -->
    <div v-if="showChatInterface && isMinimized" class="minimized-chat">
      <button @click="expandChat" class="expand-btn">
        <span>💬</span>
        <span>继续分析 {{ currentPatientName }} 的报告</span>
      </button>
    </div>
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
import uniNoticeBar from '@dcloudio/uni-ui/lib/uni-notice-bar/uni-notice-bar.vue';
import uniSection from '@dcloudio/uni-ui/lib/uni-section/uni-section.vue';
import pako from 'pako'; // 新增：用于XML压缩

// const pdfjs = require("pdfjs-dist");
// pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry.js");

pdfjsViewer.GlobalWorkerOptions.workerSrc = pdfWorker;
// 获取配置
const config = getConfig();
export default {
  name: '',
  components: {
    uniNoticeBar,
    uniSection,
  },
  data() {
    return {
      pdfDoc: null,
      xmlString: '',
      // 新增：Dify聊天相关数据
      showChatInterface: false,
      isMinimized: false,
      currentPatientName: '',
      currentXmlData: '',
      iframeKey: 0,
      dataList: [
        // {
        //   name: '张三',
        //   company: '测试医院',
        //   time: '2024-06-01',
        // },
        // {
        //   name: '李四',
        //   company: '健康体检中心',
        //   time: '2024-06-02',
        // },
      ],
      form: {
        page_no: 1,
        page_size: 10,
      },
      // noMoreData: false, // 新增：是否还有更多数据（如需实现分页终止功能可取消注释）
    };
  },
  // 新增：计算属性
  computed: {
    // 当前XML参数（gzip + base64编码）
    currentXmlParam() {
      if (!this.currentXmlData) {
        return '';
      }

      try {
        // 使用gzip压缩XML数据
        const compressed = pako.gzip(this.currentXmlData);
        // 转换为base64
        const base64 = btoa(String.fromCharCode.apply(null, compressed));
        return base64;
      } catch (error) {
        console.error('压缩编码失败:', error);
        return '';
      }
    },

    // iframe源地址
    iframeSrc() {
      const baseUrl = 'https://udify.app/chatbot/W6KLjKIF1kLPBQ8H';
      if (this.currentXmlParam) {
        return `${baseUrl}?xml=${encodeURIComponent(this.currentXmlParam)}&t=${Date.now()}`;
      }
      return baseUrl;
    },
  },
  onLoad() {
	  uni.showLoading({
	    title: '加载中',
	  });
    this.getUserListFn();
  },
  onReachBottom() {
    // if (this.noMoreData) {
    //   uni.showToast({ title: '没有更多数据了', icon: 'none' });
    //   return;
    // }
    this.form.page_no++;
    this.getUserListFnPage();
    console.log('触底了');
  },

  methods: {
	  async handleDownload(row) {
	    uni.showLoading({
	      title: '下载中',
	    });
	    const response = await axios({
	      method: 'get',
	      url: `${config.baseURL}/report/wechat-export`,
	      params: { report_id: row.report_id },
	      responseType: 'arraybuffer',
	      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
	    });
      console.log('下载接口返回内容:', response);
	  
	    const blob = new Blob([response.data], { type: 'application/pdf' });
	    const url = URL.createObjectURL(blob);
	    const link = document.createElement('a');
	    link.href = url;
	    link.download = `${row.name}报告.pdf`; // 指定下载文件名
	    link.click(); // 自动触发下载
	    URL.revokeObjectURL(url); // 释放Blob URL
	    uni.hideLoading();
	  },
    // 首次加载请求
    getUserListFn() {
      getUserList(this.form)
        .then(res => {
          this.dataList = res;
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    // 下一页加载请求（增加是否还有数据的判断）
    getUserListFnPage() {
      getUserList(this.form).then(res => {
        // if (!res || res.length < this.form.page_size) {
        //   this.noMoreData = true; // 没有更多数据了（如需实现分页终止功能可取消注释）
        // }
        this.dataList = [...this.dataList, ...res.results.data];
         // 新增：打印第一条数据
        //  if (this.dataList && this.dataList.length > 0) {
        //   console.log('dataList 第一条:', this.dataList[0]);
        // } else {
        //   console.log('dataList 为空');
        // }

      });
    },
    // 查询pdf
    // handlePdf() {
    //   this.dataList.push(...this.dataList);
    //   // getUserPdf({report_id:1}).then(res=>{
    //   // 	console.log(res,'999')
    //   // })
    // },

    handleReport(row) {
      uni.navigateTo({
        url: '/pages/patient/pdf?report_id=' + row.report_id,
      });image.png
      return;
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
      this.currentPatientName = row.name || '未知患者';
      this.showChatInterface = true;
      this.isMinimized = false;
      this.iframeKey += 1;

      // 显示加载提示
      uni.showLoading({
        title: '正在加载AI分析...'
      });

      // 获取XML数据
      getUserXml({ report_id: reportId }).then(res => {
        // 兼容不同返回结构
        const xmlString = res.getString ? res.getString('xml') : res.xml;
        console.log('xmlString：', xmlString);
        this.currentXmlData = xmlString || '';
        uni.hideLoading();
      }).catch(err => {
        console.error('获取XML失败:', err);
        uni.hideLoading();
        uni.showToast({
          title: '获取XML失败',
          icon: 'error'
        });
        // 关闭聊天界面
        this.showChatInterface = false;
      });
    },

    // 新增：聊天界面控制方法
    minimizeChat() {
      this.isMinimized = true;
      console.log('聊天界面已最小化');
    },

    expandChat() {
      this.isMinimized = false;
      console.log('聊天界面已展开');
    },

    closeChatInterface() {
      console.log('关闭聊天界面');
      this.showChatInterface = false;
      this.isMinimized = false;
      this.currentXmlData = '';
      this.currentPatientName = '';
      // 彻底清除 Dify 相关的本地会话ID，确保新会话（iframe 跨域无法操作，注释掉无效代码）
      // try {
      //   Object.keys(localStorage).forEach(key => {
      //     console.log('localStorage key:', key, localStorage.getItem(key));
      //   });
      //   Object.keys(sessionStorage).forEach(key => {
      //     console.log('sessionStorage key:', key, sessionStorage.getItem(key));
      //   });
      // } catch (e) {
      //   console.error('清除 Dify 会话ID 出错:', e);
      // }
      console.log('聊天界面已关闭');
    },
  },
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
  position: relative; // 新增：用于绝对定位右上角标签
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

/* 新增：Dify聊天界面样式 */
.iframe-container {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #dee2e6;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  z-index: 1000;
}

/* 聊天界面标题栏 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 10px 15px;
  border-bottom: 1px solid #dee2e6;
}

.chat-header h3 {
  margin: 0;
  color: #495057;
  font-size: 16px;
}

.chat-controls {
  display: flex;
  gap: 5px;
}

.minimize-btn,
.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #6c757d;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.minimize-btn:hover,
.close-btn:hover {
  background: #545b62;
}

.close-btn {
  background: #dc3545;
}

.close-btn:hover {
  background: #c82333;
}

/* 最小化后的展开按钮 */
.minimized-chat {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.expand-btn:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.expand-btn span:first-child {
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .expand-btn {
    padding: 12px 24px;
    font-size: 14px;
  }

  .chat-header h3 {
    font-size: 14px;
  }
}
.my-header {
  display: flex;
  .report-reject {
    margin-right: 10px;
    padding: 0 10px;
    border: 1px solid #ccc;
    background: #db699c;
    color: #fff;
  }
}
// 右上角报告异常标签
.report-reject-corner {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 12px;
  background: #db699c;
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  z-index: 2;
  border: 1px solid #ccc;
}
// 卡片底部按钮区域
.card-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 18px;
  margin-top: 30rpx;
  padding-bottom: 2px;
}
.action-btn {
  cursor: pointer;
  padding: 6px 18px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.action-btn.download {
  color: #1aad19;
  border: 1px solid #1aad19;
  background: #f6fff6;
}
.action-btn.download:hover {
  background: #e6f9e6;
}
.action-btn.view {
  color: #516bea;
  border: 1px solid #516bea;
  background: #f6f8ff;
}
.action-btn.view:hover {
  background: #e6eaff;
}
.action-btn.ai {
  color: #e67e22;
  border: 1px solid #e67e22;
  background: #fff8f0;
}
.action-btn.ai:hover {
  background: #ffe7cc;
}
</style>
