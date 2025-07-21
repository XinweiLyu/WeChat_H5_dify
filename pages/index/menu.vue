<template>
  <view> </view>
</template>

<script>
import { getUserInfo } from '../../api/userInfo';
import {
  wechatAuth,
  getStoredUserInfo,
  getUrlParams,
} from '../../utils/services/wechat';
import { getUserList } from '@/api/patient.js';
// import { getReportList,getReportPdf } from '../../utils/request/report'

export default {
  data() {
    return {
      userInfo: null,
      loading: true,
      reportList: [],
      // cozeClient: null, // 用于存储AI智能体实例
    };
  },
  //ceshi
  onLoad() {
    this.getUserListFn();
    // this.initializeAuth();
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
    async getUserListFn() {
      // await getUserList();
      try {
        const res = await getUserList(this.form);
		console.log(res,'ressssssssssssss')
        if (res.results && res.results.code === 200) {
          uni.navigateTo({ url: '/pages/index/index' });
        }
      } catch (error) {
		  console.log(error,'eeeeeeeeeee')
        if (error.status === 401) {
          console;
          localStorage.removeItem('token');
          // 2. 清除本地用户信息S
          localStorage.removeItem('wechat_user_info');
          this.initializeAuth();
        }
      }
    },

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
		//uni.navigateTo({ url: '/pages/index/index' });
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
        url: '/pages/patient/history',
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
.my-box {
  padding: 20px;
}
</style>
