<template>
  <div class="chat-container">
    <div class="header">
      <h2>聊天机器人</h2>
      <div class="user-selector">
        <label for="userSelect">选择用户：</label>
        <select id="userSelect" v-model="selectedUser" @change="switchUser">
          <option v-for="user in users" :key="user.id" :value="user">
            {{ user.name }}
          </option>
        </select>
        <button @click="addUser" class="add-btn">添加用户</button>
      </div>
    </div>

    <div class="user-info" v-if="selectedUser">
      <p><strong>当前用户：</strong>{{ selectedUser.name }}</p>
      <p><strong>用户ID：</strong>{{ selectedUser.id }}</p>
      <p><strong>XML参数：</strong>{{ currentXmlParam }}</p>
    </div>

    <div class="iframe-container">
      <iframe
          :src="iframeSrc"
          style="width: 100%; height: 100%; min-height: 700px"
          frameborder="0"
          allow="microphone"
          ref="chatIframe">
      </iframe>
    </div>

    <!-- 添加用户对话框 -->
    <div v-if="showAddDialog" class="modal-overlay" @click="closeDialog">
      <div class="modal" @click.stop>
        <h3>添加新用户</h3>
        <input
            v-model="newUser.name"
            placeholder="用户名称"
            class="input-field"
        />
        <input
            v-model="newUser.id"
            placeholder="用户ID"
            class="input-field"
        />
        <textarea
            v-model="newUser.xmlData"
            placeholder="XML数据（可选）"
            class="textarea-field"
            rows="4"
        ></textarea>
        <div class="modal-buttons">
          <button @click="saveUser" class="save-btn">保存</button>
          <button @click="closeDialog" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import pako from 'pako' // 需要安装: npm install pako

export default {
  name: 'ChatbotPage',
  setup() {
    // 响应式数据
    const selectedUser = ref(null)
    const showAddDialog = ref(false)
    const newUser = ref({
      name: '',
      id: '',
      xmlData: ''
    })

    // 用户列表
    const users = ref([
      {
        id: 'user001',
        name: '张三',
        xmlData: '<user><name>张三</name><role>admin</role></user>'
      },
      {
        id: 'user002',
        name: '李四',
        xmlData: '<user><name>李四</name><role>user</role></user>'
      },
      {
        id: 'user003',
        name: '王五',
        xmlData: '<user><name>王五</name><role>guest</role></user>'
      }
    ])

    // 计算属性：当前XML参数（gzip + base64编码）
    const currentXmlParam = computed(() => {
      if (!selectedUser.value || !selectedUser.value.xmlData) {
        return ''
      }

      try {
        // 使用gzip压缩XML数据
        const compressed = pako.gzip(selectedUser.value.xmlData)
        // 转换为base64
        const base64 = btoa(String.fromCharCode.apply(null, compressed))
        return base64
      } catch (error) {
        console.error('压缩编码失败:', error)
        return ''
      }
    })

    // 计算属性：iframe源地址
    const iframeSrc = computed(() => {
      const baseUrl = 'https://udify.app/chatbot/W6KLjKIF1kLPBQ8H'
      if (currentXmlParam.value) {
        return `${baseUrl}?xml=${encodeURIComponent(currentXmlParam.value)}`
      }
      return baseUrl
    })

    // 方法
    const switchUser = () => {
      console.log('切换用户:', selectedUser.value)
      // 这里可以添加切换用户后的其他逻辑
    }

    const addUser = () => {
      showAddDialog.value = true
      newUser.value = { name: '', id: '', xmlData: '' }
    }

    const saveUser = () => {
      if (!newUser.value.name || !newUser.value.id) {
        alert('请填写用户名称和ID')
        return
      }

      // 检查ID是否重复
      if (users.value.find(user => user.id === newUser.value.id)) {
        alert('用户ID已存在')
        return
      }

      // 添加新用户
      users.value.push({
        id: newUser.value.id,
        name: newUser.value.name,
        xmlData: newUser.value.xmlData || `<user><name>${newUser.value.name}</name><id>${newUser.value.id}</id></user>`
      })

      closeDialog()
    }

    const closeDialog = () => {
      showAddDialog.value = false
    }

    // 生命周期
    onMounted(() => {
      // 默认选择第一个用户
      if (users.value.length > 0) {
        selectedUser.value = users.value[0]
      }
    })

    return {
      selectedUser,
      users,
      showAddDialog,
      newUser,
      currentXmlParam,
      iframeSrc,
      switchUser,
      addUser,
      saveUser,
      closeDialog
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.user-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-selector label {
  font-weight: bold;
  color: #555;
}

.user-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #0056b3;
}

.user-info {
  background: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.user-info p {
  margin: 5px 0;
  font-size: 14px;
}

.user-info strong {
  color: #495057;
}

.iframe-container {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.textarea-field {
  resize: vertical;
  font-family: inherit;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background: #218838;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #545b62;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .user-selector {
    flex-wrap: wrap;
  }

  .chat-container {
    padding: 10px;
  }
}
</style>
