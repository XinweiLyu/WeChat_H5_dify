<template>
    <view>
      <!-- 添加loading遮罩层 -->
      <view class="loading-overlay" v-if="loading">
        <view class="loading-content">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ loadingText }}</text>
          <text class="loading-subtext" v-if="loadingSubtext">{{ loadingSubtext }}</text>
        </view>
      </view>
    
      <!-- <view class="my-box">
          <img src="@/static/one.png" alt="" />
      </view> -->
      <!-- <view class="user-info" v-if="userInfo">
        <view class="user-avatar">
          <image :src="userInfo.headimgurl" mode="aspectFill"></image>
        </view>
        <view class="user-details">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="other-info"
            >{{ userInfo.province }} {{ userInfo.city }}</text
          >
        </view>
      </view> -->
     <!-- <view class="loading" v-else-if="loading">
        <text>加载中...</text>
      </view> -->
      <!-- 只有在非loading状态下才显示内容 -->
      <view v-if="!loading">
        <view class="actions">
          <button @click="viewHistory" :disabled="loading">查看历史检测记录</button>
          <!-- <button @click="viewPdfReport">查看PDF报告</button> -->
          <!-- <button @click="goToAIChat">AI心理治疗师</button> -->
          <!-- <button @click="handleGetUserinfo">请求按钮</button> -->
          <!-- <button @click="goToDifyChatbot">Dify 聊天机器人</button> -->
        </view>
        <div id="ai-chat"></div>
        <view v-if="reportList.length">
          <view v-for="item in reportList" :key="item.report_id" class="report-card">
            <view>{{ item.name }}</view>
            <view>机构：{{ item.company }}</view>
            <view>{{ item.time }}</view>
            <button @click="viewReport(item)">查看报告</button>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  import { getUserInfo } from '../../api/userInfo';
  import {
    wechatAuth,
    getStoredUserInfo,
    getUrlParams,
  } from '../../utils/services/wechat';
  import {getUserList} from '@/api/patient.js';
  // import { getReportList,getReportPdf } from '../../utils/request/report'
  
  export default {
    data() {
      return {
        userInfo: null,
        loading: true, // 初始化为true，页面加载时显示loading
        loadingText: '正在加载...', // 动态loading文本
        loadingSubtext: '', // 副标题文本
        reportList: [],
        isNavigating: false, // 防止重复跳转
        // cozeClient: null, // 用于存储AI智能体实例
      };
    },
    //ceshi
    onLoad() {
      // 页面加载时立即显示loading，阻止所有交互
      this.loading = true;
      this.isNavigating = false;
      
      // 检查URL中是否有code参数，判断是否是微信授权回调
      const { code } = getUrlParams();
      console.log('页面加载，URL中的code:', code);
      
      // 使用nextTick确保loading状态立即生效
      this.$nextTick(() => {
        if (code) {
          // 有code参数，说明是微信授权回调，显示loading
          console.log('检测到微信授权回调，开始处理授权');
          this.initializeAuth();
        } else {
          // 没有code参数，可能是首次访问，也要显示loading
          console.log('首次访问，准备跳转到微信授权页');
          this.prepareWechatAuth();
        }
        this.getUserListFn();
      });
    },
  
    // 添加onShow生命周期，确保每次页面显示时都正确设置loading状态
    onShow() {
      // 如果页面还在加载中，确保loading状态正确
      if (this.loading) {
        console.log('页面显示时仍在加载中');
      }
    },
  
   
  
    
  
    //  mounted() {
    // // this.initAIChatSDK();
    //  },
  
    // mounted() {
    //   // Dify Chatbot 配置与脚本动态加载
    //   window.difyChatbotConfig = {
    //     token: 'Ocbye00VUm4GiKGw',
    //     baseUrl: 'http://127.0.0.1'
    //   };
    //   const script = document.createElement('script');
    //   script.src = 'http://127.0.0.1/embed.min.js';
    //   script.id = 'Ocbye00VUm4GiKGw';
    //   script.defer = true;
    //   document.body.appendChild(script);
    // },
  
    methods: {
        async getUserListFn(){
            try {
                await getUserList();
            } catch (error) {
                console.error('获取用户列表失败:', error);
            }
        },
        
      // 新增：准备微信授权的方法
      async prepareWechatAuth() {
        try {
          // 检查是否已有存储的用户信息
          const storedInfo = getStoredUserInfo();
          if (storedInfo) {
            console.log('发现已存储的用户信息，直接使用');
            this.userInfo = storedInfo;
            this.loading = false;
            return;
          }
          
          // 没有存储信息，需要微信授权
          console.log('准备跳转到微信授权页');
          this.loadingText = '正在跳转到微信授权...';
          this.loadingSubtext = '请稍候，即将跳转到微信授权页面';
          
          // 延迟一点时间确保loading显示
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 调用微信授权，这会跳转到微信授权页
          await wechatAuth();
          // 注意：这里不会执行到，因为wechatAuth会跳转页面
        } catch (error) {
          console.error('准备微信授权失败:', error);
          this.loading = false;
        }
      },
        
      async initializeAuth() {
        try {
          // 尝试获取已存储的用户信息
          const storedInfo = getStoredUserInfo();
          if (storedInfo) {
            console.log('发现已存储的用户信息');
            this.userInfo = storedInfo;
            // 授权完成，关闭loading
            this.loading = false;
            return;
          }
  
          // 进行微信授权
          console.log('开始微信授权流程');
          this.loadingText = '正在处理微信授权...';
          this.loadingSubtext = '请稍候，正在验证您的身份';
          
          const userInfo = await wechatAuth();
          console.log('微信授权完成:', userInfo);
          if (userInfo) {
            this.userInfo = userInfo;
          }
          // 授权完成，关闭loading
          this.loading = false;
        } catch (error) {
          uni.showToast({
            title: '授权失败，请重试',
            icon: 'none',
          });
          console.error('授权失败:', error);
          // 即使授权失败也要关闭loading
          this.loading = false;
        }
      },
  
      viewHistory() {
        // 防止重复跳转
        if (this.isNavigating || this.loading) {
          console.log('正在跳转中或页面还在加载，忽略点击');
          return;
        }
        
        this.isNavigating = true;
        console.log('开始跳转到历史记录页面');
        
        uni.navigateTo({
          url: '/pages/patient/history',
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            this.isNavigating = false;
            uni.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            });
          },
          complete: () => {
            // 延迟重置状态，避免快速重复点击
            setTimeout(() => {
              this.isNavigating = false;
            }, 1000);
          }
        });
      },
      
      // 将接口传给后端
      handleGetUserinfo() {
        const { code } = getUrlParams();
        getUserInfo(code);
      },
  
      
  
      // initAIChatSDK() {
      //   if (!window.CozeWebSDK) {
      //     const script = document.createElement('script');
      //     script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js';
      //     script.onload = () => {
      //       this.initAIChat();
      //     };
      //     document.body.appendChild(script);
      //   } else {
      //     this.initAIChat();
      //   }
      // },
      // initAIChat() {
      //   if (this.cozeClient) {
      //     return;
      //   }
      //   this.cozeClient = new window.CozeWebSDK.WebChatClient({
      //     config: {
      //       bot_id: '7508678239494193206',
      //     },
      //     componentProps: {
      //       title: '心理治疗师',
      //     },
      //     auth: {
      //       type: 'token',
      //       token: 'pat_cdJe9GXVojOlk9W1pXL8lAbxUZj0Q3R4N2jpGaYzgbnr0saxy1N8E3RHDne0kcum',
      //       onRefreshToken: function () {
      //         return 'pat_cdJe9GXVojOlk9W1pXL8lAbxUZj0Q3R4N2jpGaYzgbnr0saxy1N8E3RHDne0kcum';
      //       }
      //     }
      //   });
      // }
  
  
  
      async fetchReportList() {
        try {
          const res = await getReportList();
          if (res.results && res.results.code === 200) {
            this.reportList = res.results.data;
          }
        } catch (e) {
          uni.showToast({ title: '获取报告失败', icon: 'none' });
        }
      },
  
      viewReport(item) {
        window.open(
          `http://277fbfd6.cpolar.top/report/wechat-export/?report_id=${item.report_id}`
        );
      },
    },
  };
  </script>
  
  <style>
  .header {
    text-align: center;
    margin: 20px 0;
  }
  
  .title {
    font-size: 24px;
    color: #333;
  }
  
  .user-info {
    margin: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
    margin-right: 15px;
  }
  
  .user-avatar image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  
  .user-details {
    flex: 1;
  }
  
  .nickname {
    font-size: 18px;
    color: #333;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .other-info {
    font-size: 14px;
    color: #666;
  }
  
  .loading {
    text-align: center;
    margin: 20px;
    color: #666;
  }
  
  .actions {
    margin-top: 30px;
    padding: 0 20px;
  }
  
  button {
    margin-bottom: 15px;
    background-color: #07c160;
    color: #fff;
    border-radius: 4px;
    padding: 12px 0;
    font-size: 16px;
  }
  
  button:active {
    opacity: 0.8;
  }
  
  #dify-chatbot-bubble-button {
    background-color: #1c64f2 !important;
  }
  #dify-chatbot-bubble-window {
    width: 24rem !important;
    height: 40rem !important;
  }
  
  .report-card {
    margin: 10px 0;
    padding: 15px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px #eee;
  }
  .my-box{
      padding: 20px;
  }
  
  /* Loading 遮罩层样式 */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    pointer-events: auto; /* 确保可以接收点击事件 */
  }
  
  .loading-content {
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none; /* 防止loading内容被点击 */
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #07c160;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  .loading-text {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
  }
  
  .loading-subtext {
    font-size: 14px;
    color: #666;
    text-align: center;
    max-width: 200px;
    line-height: 1.4;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 当loading时，禁用所有按钮 */
  button:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  </style>
  