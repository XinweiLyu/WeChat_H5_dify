<template>
  <view>
    <view class="header">
      <text class="title">用户报告</text>
      <img src="/static/logo.png" alt="" />
      <!-- <img src="/public/static/logo.png" alt="">  -->
    </view>
    <view class="user-info" v-if="userInfo">
      <view class="user-avatar">
        <image :src="userInfo.headimgurl" mode="aspectFill"></image>
      </view>
      <view class="user-details">
        <text class="nickname">{{ userInfo.nickname }}</text>
        <text class="other-info"
          >{{ userInfo.province }} {{ userInfo.city }}</text
        >
      </view>
    </view>
    <view class="loading" v-else-if="loading">
      <text>加载中...</text>
    </view>
    <view class="actions">
      <button @click="viewHistory">查看历史检测记录</button>
      <button @click="viewPdfReport">查看PDF报告</button>
      <!-- <button @click="goToAIChat">AI心理治疗师</button> -->
      <button @click="handleGetUserinfo">请求按钮</button>
    </view>
    <div id="ai-chat"></div>
  </view>
</template>

<script>
import { getUserInfo } from '../../api/userInfo';
import {
  wechatAuth,
  getStoredUserInfo,
  getUrlParams,
} from '../../utils/services/wechat';

export default {
  data() {
    return {
      userInfo: null,
      loading: true,
      // cozeClient: null, // 用于存储AI智能体实例
    };
  },
  //  onLoad() {
  // //验证微信可无端打开
  //    this.initializeAuth();
  //  },
  //  mounted() {
  // // this.initAIChatSDK();
  //  },

  methods: {
    async initializeAuth() {
      try {
        this.loading = true;
        // 尝试获取已存储的用户信息
        const storedInfo = getStoredUserInfo();
        if (storedInfo) {
          console.log(4);
          this.userInfo = storedInfo;
          this.loading = false;
          return;
        }

        // 进行微信授权
        const userInfo = await wechatAuth();
        console.log(1);
        if (userInfo) {
          this.userInfo = userInfo;
        }
      } catch (error) {
        uni.showToast({
          title: '授权失败，请重试',
          icon: 'none',
        });
        console.error('授权失败:', error);
      } finally {
        this.loading = false;
      }
    },
    viewHistory() {
      uni.navigateTo({
        url: '/pages/index/historyRecords/historyRecords',
      });
    },

    viewPdfReport() {
      // 实现查看PDF报告的逻辑
      uni.showToast({
        title: '功能开发中',
        icon: 'none',
      });
    },
    // viewPdfReport() {
    //     // 使用本地PDF文件作为占位符
    //     const filePath = '/static/report.pdf';
    //     wx.openDocument({
    //       filePath: filePath,
    //       success: function (res) {
    //         console.log('打开文档成功');
    //       },
    //       fail: function (err) {
    //         console.error('打开文档失败', err);
    //       }
    //     });
    //   },

    handleGetUserinfo() {
      const { code } = getUrlParams();
      getUserInfo(code);
    },

    // showAIChat() {
    //   // 此方法已废弃，不再使用
    // },
    // initAIChat() {
    //   // 此方法已废弃，不再使用
    // },
    // goToAIChat() {
    //   uni.navigateTo({
    //     url: '/pages/aiChat/aiChat'
    //   });
    // },

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
</style>
