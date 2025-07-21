import { get, post, put, del } from "../utils/request/http";

// export const getUserInfo = () => {
//     return get('/user/wechat-login/');
// };
export const getUserInfo = (code) => {
    return get(`/user/wechat-login/?code=${code}`);
};