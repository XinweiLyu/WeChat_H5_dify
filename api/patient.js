import { get, post, put, del } from "../utils/request/http";
// 查看列表
export const getUserList = (params) => {
    return get(`/report/wechat-reports/`,params);
};
// 查看Pdf
// export const getUserPdf = (params) => {
//     return get(`/report/wechat-export`,params);
// };

export const getUserPdf = (params) => {
    return get(`/report/wechat-export`, params);
};

// 获取 XML 报告
export const getUserXml = (params) => {
    return get(`/report/wechat-xml/`, params);
};

