import { LabelComponent, _decorator ,Node} from "cc";
import LoadingSceneBase from "../../framework3D/misc/LoadingSceneBase";
import Platform from "../../framework3D/extension/Platform";
import { evt } from "../../framework3D/core/EventManager";
import WeakNetGame from "../../framework3D/extension/weak_net_game/WeakNetGame";
import { ServerConfig } from "./ServerConfig";
import { PlayerInfo } from "./PlayerInfo";
import ccUtil from "../../framework3D/utils/ccUtil";
import TipInfo from "../Data/TipInfo";


const { ccclass, property } = _decorator;

let inited = false;

@ccclass
export default class LoadingScene extends LoadingSceneBase {

    @property(LabelComponent)
    Tips: LabelComponent = null;

    onLoad() {
        super.onLoad();
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this)
    }

    async loadGameRes() {
        await this.loadSubPackage("model", '加载模型')
        await this.loadSubPackage("textures", '加载模型')
        return
    }

    canRetry = false;

    async nextScene() {
        try {
            let data = ccUtil.get(TipInfo, g.randomInt(1, csv.Tip.size));
            this.Tips.string = data.txt;
            // csv.createIndex("Audio", "Key", "config_data")
            // if (PlayerInfo.guide == 0) {
            await this.loadGameRes();
            // PlayerInfo.guide = 1;
            // PlayerInfo.save('guide')
            // LoadingScene.setNextScene('Level')
            // } else {
            //慢慢加载
            //如果玩家汽车id > xxx 
            // let sceneName = LoadingScene.getNextScene()
            // Platform.loadSubPackage("_car2")
            // if (sceneName == "Game") {
            //     //主场景 

            //     await this.loadSubPackage("ui_home", "加载UI资源")
            //     await this.loadSubPackage("car_thumbnail", "加载汽车小图")
            // } else {
            //     //游戏场景
            //     await this.loadGameRes();
            // }
            // }
            this.loadNextScene()
            evt.emit("Loading.Success")
        } catch (e) {
            console.error(e);
            this.label.string = "加载失败，点击屏幕重试!"
            this.canRetry = true;
        }
    }

    //csv config share_config complete
    loginProgress(evt, ext) {
        switch (evt) {
            case 'login':
                this.label.string = "登录中"
                this.progress = 0.1;
                break;
            case 'config':
                this.label.string = "加载配置"
                this.progress = 0.2;
                break;
            case 'local_csv':
                this.label.string = "加载本地配置"
                this.progress = 0.3;
                break;
            // case 'local_csv_loaded':
            //     this.label.string = "已加载配置(" + ext + ")"
            //     this.progress = 0.5;
            case "csv":
                this.label.string = "加载网络配置"
                this.progress = 0.6;
                break;
            case 'share_config':
                this.label.string = "加载分享配置"
                this.progress = 0.7;
                break;
            case "complete":
                this.label.string = "进入游戏..."
                this.progress = 0.8;
                break;
        }
    }


    onClick() {
        if (this.canRetry) {
            this.startLogin();
            this.canRetry = false;
        }
    }

    start() {
        this.startLogin();



    }

    startLogin() {
        //do init 

        if (!inited) {
            WeakNetGame.initConfig(ServerConfig);
            //第一进入游戏 的loading 界面 
            // WeakNetGame.downloadCsv("Config").then(v => {
            //     console.log("加载Config成功！！")
            //     csv.removeIndex("Config", "Key");
            //     csv.createIndex("Config", "Key", "config_data")
            // })
        }
        if (!inited) {
            //console.log("loading init !!!!!")
            // login using wx code ,
            //使用openid 登陆可以记录数据 
            WeakNetGame.doLogin(this.loginProgress.bind(this)).then(data => {
                inited = true;
                this.nextScene();
            }).catch(e => {
                console.error(e)
                this.progress = 0;
                this.label.string = `登录失败，点击屏幕重试！(${e})`
            })
        } else {
            this.nextScene();
            this.canRetry = true;
        }

    }

}