import wx from 'weixin-js-sdk';
import Axios from 'axios';

let currentHost = "";
// 测试/生产
// let id = process.env.NODE_ENV === 'development' ? '':''; // 测试/生产

let opts = {
    title: '', // 微信分享标题
    summary: '！', // qq分享描述
    desc: '！', // 微信分享描述
    url: window.location.href, // qq分享链接
    link: window.location.href, // 微信分享链接
    pic: '', // qq分享图标
    imgUrl: '' // 微信分享图标
};
//判断是否是微信浏览器
export const isWeixin = function() {
    let ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
};
//qq分享
export const qqShare = function() {
    setShareInfo(opts);
};
//微信分享
export const wxShare = function() {
    Axios.get(`https://xxx.com?url=${encodeURIComponent(window.location.href)}`, {}).then((res) => {
        // 通过config接口注入权限验证配置
        let Data = eval('(' + res.data + ')').data;
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作
        wx.config({
            debug: false, // 开启调试模式,开发时可以开启
            appId: Data.appId, // 必填，公众号的唯一标识   由接口返回
            timestamp: Data.timestamp, // 必填，生成签名的时间戳 由接口返回
            nonceStr: Data.nonceStr, // 必填，生成签名的随机串 由接口返回
            signature: Data.signature, // 必填，签名 由接口返回
            jsApiList: ['onMenuShareTimeline', 'closeWindow', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'] // 此处填你所用到的方法
        });
        // 通过ready接口处理成功验证
        wx.ready(function() {
            // 分享到朋友圈
            wx.onMenuShareTimeline(opts);
            // 分享给朋友
            wx.onMenuShareAppMessage(opts);
            wx.onMenuShareQQ(opts);
            wx.onMenuShareWeibo(opts);
        });
    }).catch((res) => {
        console.info(res);
    });
};

isWeixin() ? wxShare() : qqShare();