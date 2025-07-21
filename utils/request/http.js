//是封装和管理 HTTP 请求
import axios from 'axios';
import getConfig from '../services/config';

// 获取配置
const config = getConfig();

// 创建一个 axios 实例
const instance = axios.create({
    baseURL: config.baseURL,
    timeout: 30000, // 请求超时时间（毫秒）
    headers: {
        'Content-Type': 'application/json', // 如果需要上传文件需要修改
    },
});


// 请求拦截器
// 在请求发送之前，拦截器会检查本地存储中是否有 token，如果有，则将其添加到请求头中作为 Authorization。
instance.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么，例如添加 token 到 headers
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 鉴权
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        // 对响应数据做些什么，例如统一处理响应结构
        console.log('response',response);
        
        // 检查是否有results字段
        if (response.data.results && response.data.results.code === 200) {
            // 新的数据结构：{count, next, previous, results: {code, message, data}}
            return response.data; // 返回完整的数据结构
        } else if (response.data.code === 200) {
            // 兼容旧的数据结构：{code, message, data}
            return response.data;
        } else {
            // 处理业务逻辑错误
            const errorMessage = response.data.results?.message || response.data.message || '请求失败';
            console.error('API Error:', errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    },
    (error) => {
        // 对响应错误做些什么，例如网络错误、服务器错误等
        console.log('401跳转开始', error.response?.data?.code);
        
        // 🚨 修改401错误处理逻辑
        if (error.response && error.response.status === 401) {
            // 1. 清除本地 token
            localStorage.removeItem('token');
            // 2. 清除本地用户信息
            localStorage.removeItem('wechat_user_info');
            
            // 🚨 不再强制跳转，而是让调用方处理
            console.log('401错误：用户未授权或token已过期');
            
            // 可以选择显示提示信息
            if (typeof uni !== 'undefined') {
                uni.showToast({
                    title: '请重新授权',
                    icon: 'none',
                    duration: 2000
                });
            }
        }
        
        console.error('Network Error:', error);
        console.log('error.response', error.response);
        return Promise.reject(error);
    }
);

// 封装 GET 请求
export function get(url, params, options = {}) {
    console.log(url, params, 'params');
    return instance.get(url, { params, ...options });
}

// 封装 POST 请求
export function post(url, data) {
    return instance.post(url, data);
}

// 封装 PUT 请求
export function put(url, data) {
    return instance.put(url, data);
}

// 封装 DELETE 请求
export function del(url) {
    return instance.delete(url);
}