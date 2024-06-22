import { _decorator, Component, Game } from "cc";
import Device from "../../framework3D/misc/Device";
import { evt } from "../../framework3D/core/EventManager";
import Platform from "../../framework3D/extension/Platform";
import ViewManager from "../../framework3D/ui/ViewManager";
import { PlayerInfo } from "./PlayerInfo";
import { buffSystem } from "../../framework3D/misc/buffs/BuffSystem";
import { UserInfo } from "../../framework3D/extension/weak_net_game/UserInfo";
import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";


const { ccclass, property } = _decorator;
//config.csv配置
//BannerAdWhiteList 需要显示banner 的view列表
@ccclass
export default class PersistNode extends Component {
    isNewUser: boolean = true;
    onLoad() {
        // game.addPersistRootNode(this.node)
        // game.on(Game.EVENT_SHOW, this.onShow, this);
        // game.on(Game.EVENT_HIDE, this.onHide, this)
        Device.setAudioPath("Audio/")
        // csv.setParser((type, value) => {
        //     if (type == "item") {
        //         // let ret = []
        //         if (typeof (value) == "string") {
        //             // let vs = value.split(";")
        //             // vs.forEach(v => {
        //             let arr = value.split(",")
        //             let r = { type: arr[0], id: arr[1], count: parseInt(arr[2]) }
        //             // ret.push(r)
        //             // })
        //             return r
        //         }
        //     }
        // })
        evt.on("wxsdk.BannerReady", this.onBannerReady, this);
        evt.on("View.onShow", this.onViewShow, this)
        evt.on("View.onHidden", this.onViewHidden, this)
        evt.on("Loading.Success", this.onLoadingSuccess, this);

    }

    onViewShow(view) {
        if (view.node.name == "UIGuider") return;
        // if (!csv.Config) return;
        // if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
        //     Platform.showBannerAd();
        // } else {
        //     Platform.hideBannerAd();
        // }
    }

    onViewHidden(view) {
        // if (!csv.Config) return;
        // if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
            Platform.hideBannerAd();
        // }
        // if (csv.Config.BannerAdRefreshWhiteList && csv.Config.BannerAdRefreshWhiteList.indexOf(view.node.name) != -1) {
        //     Platform.refreshBannerAd();
        // }

    }
    onDestroy() {
        evt.off(this);
    }

    onBannerReady() {
        if (ViewManager.instance) {
            ViewManager.instance.allViews.forEach(v => {
                // csv.Config.BannerActiveViews
                // csv.Config.ShowBannerViews
                if (v.node.active) {
                    // if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(v.node.name) == -1) {
                    //     //没有在白名单里的要隐藏 
                    //     console.log(v.node.name + "未在白名单里，隐藏banner");
                    //     Platform.hideBannerAd();
                    // }
                }
            })
        }

    }

    onShow(a) {
        console.log("----------onShow" + JSON.stringify(a));
        // Cloud.reload();

        // if (CC_WECHAT) {
        //     // 个人聊天 卡片1007， 群聊天 卡片 1008 , 1044 
        //     //点自已的卡片
        //     console.log(a.query.share_link, a.query.uuid, WeakNetGame.sharedUUIDs)
        //     if (a.query.share_link == "true" && WeakNetGame.isValidShare(a.query.uuid)) {
        //         if (a.scene == 1007) {
        //             Toast.make("点击个人的分享链接不会获得奖励哟~请分享到微信群吧！")
        //             console.log("链接分享：个人")
        //         }
        //         else {
        //             if (a.scene == 1008 || a.scene == 1044) {
        //                 console.log("链接分享：群", a.scene)
        //                 if (WeakNetGame.isClaimedShare(a.query.uuid)) {
        //                     Toast.make("短时间内，不能点击相同群的分享链接！请分享到其他群吧！")
        //                 } else {
        //                     WeakNetGame.claimShare(a.query.uuid);
        //                     // vm.hide("Prefab/UI/UIShareLink")
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    onHide() {
        // if (!DEBUG) {
        //     PlayerInfo.save();
        // }
        buffSystem.save();
        UserInfo.exitGame();
        this.unschedule(this.time30);
        this.unschedule(this.time45);
        this.unschedule(this.time60);
    }

    start() {
        let isn = localStorage.getItem("PlayerInfo.guide")
        if (isn == null || isn == "") {
            this.isNewUser = true
        } else {
            this.isNewUser = false;
        }
        if (this.isNewUser) {
            //开始加载
            StatHepler.userAction("开始加载")
        }
    }

    onLoadingSuccess() {
        evt.off("Loading.Success", this.onLoadingSuccess, this);
        if (this.isNewUser) {
            this.scheduleOnce(this.time30, 30);
            this.scheduleOnce(this.time45, 45);
            this.scheduleOnce(this.time60, 60);
            StatHepler.userAction("加载成功")
        }
    }

    time30() {
        StatHepler.userAction("30s未退出")
    }

    time45() {
        StatHepler.userAction("45s未退出")
    }

    time60() {
        StatHepler.userAction("60s未退出")
    }
}