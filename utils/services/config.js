// 环境配置
const env = {
    // 开发环境，测试地址
    development: {
        //baseURL: 'http://277fbfd6.cpolar.top',
        //baseURL: 'https://277fbfd6.vip.cpolar.cn',
		baseURL: 'https://zchat.i-llusion.cn',
		downloadUrl:'https://zchat.i-llusion.cn'
    },
    // 线上环境,正式地址
    production: {
        //baseURL: 'http://47.106.245.28:8002',
        baseURL: 'https://zchat.i-llusion.cn',
        //baseURL: 'https://277fbfd6.vip.cpolar.cn',
		downloadUrl:'https://zchat.i-llusion.cn'

    }
}

// 根据环境返回对应配置
export default function getConfig() {
    // #ifdef H5
    if (process.env.NODE_ENV === 'development') {
        return env.development;
    }
    // #endif

    // #ifdef APP-PLUS || MP
    // 在APP或小程序中，可以根据需要返回不同环境的配置
    return env.development;
    // #endif

    return env.production;
} 