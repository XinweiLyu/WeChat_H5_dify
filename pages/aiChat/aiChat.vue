<template>
  <view>
    <div id="ai-chat"></div>
  </view>
</template>

<script>
export default {
  onReady() {
    // 动态插入SDK
    if (!window.CozeWebSDK) {
      const script = document.createElement('script');
      script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js';
      script.onload = () => {
        this.initAIChat();
      };
      document.body.appendChild(script);
    } else {
      this.initAIChat();
    }
  },
  methods: {
    initAIChat() {
      // 保存实例到 this.cozeClient，避免多次创建
      if (this.cozeClient) {
        return;
      }
      this.cozeClient = new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: '7508678239494193206',
        },
        componentProps: {
          title: '心理治疗师',
        },
        auth: {
          type: 'token',
          token: 'pat_cdJe9GXVojOlk9W1pXL8lAbxUZj0Q3R4N2jpGaYzgbnr0saxy1N8E3RHDne0kcum',
          onRefreshToken: function () {
            return 'pat_cdJe9GXVojOlk9W1pXL8lAbxUZj0Q3R4N2jpGaYzgbnr0saxy1N8E3RHDne0kcum'
          }
        }
      });
    }
  }
}
</script>

<style>
#ai-chat {
  width: 100vw;
  height: 100vh;
}
</style> 