(function () {
    let wxapi = "//res.wx.qq.com/open/js/jweixin-1.6.0.js", qqapi = "//open.mobile.qq.com/sdk/qqapi.js?_bid=152",
        qzapi = "//qzonestyle.gtimg.cn/qzone/phone/m/v4/widget/mobile/jsbridge.js?_bid=339";
    let require;

    function _require(url, onload) {
        let doc = document;
        let head = doc.head || (doc.getElementsByTagName("head")[0] || doc.documentElement);
        let node = doc.createElement("script");
        node.onload = onload;
        node.onerror = function () {
        };
        node.async = true;
        node.src = url[0];
        head.appendChild(node);
    }

    function _initWX(data) {
        if (!data.WXconfig) {
            return;
        }
        require([wxapi], function (wx) {
            if (!wx.config) {
                wx = window.wx;
            }
            let conf = data.WXconfig;
            wx.config({
                debug: false,
                appId: conf.appId,
                timestamp: conf.timestamp,
                nonceStr: conf.nonceStr,
                signature: conf.signature,
                jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone", "updateTimelineShareData", "updateAppMessageShareData"]
            });
            wx.error(function (res) {
            });
            wx.ready(function () {
                let config = {
                    title: data.title,
                    desc: data.summary,
                    link: data.url,
                    imgUrl: data.pic,
                    type: "",
                    dataUrl: "",
                    success: function () {
                        data.callback && data.callback();
                    },
                    cancel: function () {
                    }
                };
                wx.updateTimelineShareData && wx.updateTimelineShareData(config); //分享到朋友圈”及“分享到QQ空间
                wx.updateAppMessageShareData && wx.updateAppMessageShareData(config);//分享给朋友”及“分享到QQ
                wx.onMenuShareAppMessage && wx.onMenuShareAppMessage(config);//分享到微信，即将废弃
                wx.onMenuShareQQ && wx.onMenuShareQQ(config);//分享到qq，即将废弃
                wx.onMenuShareQZone && wx.onMenuShareQZone(config);//分享到qq空间，即将废弃
                if (conf.swapTitleInWX) {
                    wx.onMenuShareTimeline && wx.onMenuShareTimeline({
                        title: data.summary,
                        desc: data.title,
                        link: data.url,
                        imgUrl: data.pic,
                        type: "",
                        dataUrl: "",
                        success: function () {
                            data.callback && data.callback();
                        },
                        cancel: function () {
                        }
                    });
                } else {
                    wx.onMenuShareTimeline && wx.onMenuShareTimeline(config); //分享到朋友圈，即将废弃
                }
            });
        });
    }

    function _initQQ(data) {
        let info = {title: data.title, desc: data.summary, share_url: data.url, image_url: data.pic};

        function doQQShare() {
            try {
                if (data.callback) {
                    window.mqq.ui.setOnShareHandler(function (type) {
                        if (type == 3 && (data.swapTitle || data.WXconfig && data.WXconfig.swapTitleInWX)) {
                            info.title = data.summary;
                        } else {
                            info.title = data.title;
                        }
                        info.share_type = type;
                        info.back = true;
                        window.mqq.ui.shareMessage(info, function (result) {
                            if (result.retCode === 0) {
                                data.callback && data.callback.call(this, result);
                            }
                        });
                    });
                } else {
                    window.mqq.data.setShareInfo(info);
                }
            } catch (e) {
            }
        }

        if (window.mqq) {
            doQQShare();
        } else {
            require([qqapi], function () {
                doQQShare();
            });
        }
    }

    function _initQZ(data) {
        function doQZShare() {
            if (QZAppExternal && QZAppExternal.setShare) {
                let imageArr = [], titleArr = [], summaryArr = [], shareURLArr = [];
                for (let i = 0; i < 5; i++) {
                    imageArr.push(data.pic);
                    shareURLArr.push(data.url);
                    if (i === 4 && (data.swapTitle || data.WXconfig && data.WXconfig.swapTitleInWX)) {
                        titleArr.push(data.summary);
                        summaryArr.push(data.title);
                    } else {
                        titleArr.push(data.title);
                        summaryArr.push(data.summary);
                    }
                }
                QZAppExternal.setShare(function (data) {
                }, {
                    "type": "share",
                    "image": imageArr,
                    "title": titleArr,
                    "summary": summaryArr,
                    "shareURL": shareURLArr
                });
            }
        }

        if (window.QZAppExternal) {
            doQZShare();
        } else {
            require([qzapi], function () {
                doQZShare();
            });
        }
    }

    function init(opts) {
        let ua = navigator.userAgent;
        let isWX = ua.match(/MicroMessenger\/([\d\.]+)/), isQQ = ua.match(/QQ\/([\d\.]+)/),
            isQZ = ua.indexOf("Qzone/") !== -1;
        isWX && _initWX(opts);
        isQQ && _initQQ(opts);
        isQZ && _initQZ(opts);
    }

    if (typeof define === "function" && (define.cmd || define.amd)) {
        if (define.cmd) {
            require = seajs.use;
        } else {
            if (define.amd) {
                require = window.require;
            }
        }
        define(function () {
            return init;
        });
    } else {
        require = _require;
        window.setShareInfo = init;
    }
})();
