// // utils/services/report.js
// import request from '@/utils/request' // 你项目的请求封装

// // 获取报告列表
// export function getReportList() {
//   return request({
//     url: 'http://22c4da7.r9.cpolar.top/report/wechat-reports/',
//     method: 'GET',
//     // 需要加 token 的话，headers 里加
//   })
// }

// // 获取PDF报告
// export function getReportPdf(report_id) {
//   return request({
//     url: `http://22c4da7.r9.cpolar.top/report/wechat-export/?report_id=${report_id}`,
//     method: 'GET',
//     responseType: 'blob', // 下载PDF用
//   })
// }