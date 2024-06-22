import { Component, _decorator, Node, ColliderComponent, Vec3, director } from "cc";
import Car from "./Car";
import ccUtil from "../framework3D/utils/ccUtil";
import HitShake from "./HitShake";
import { EmotionType } from "./Emotion";
import { UserInfo } from "../framework3D/extension/weak_net_game/UserInfo";
import TipInfo from "./Data/TipInfo";
import { Toast } from "../framework3D/ui/ToastManager";
import Device from "../framework3D/misc/Device";
import { evt } from "../framework3D/core/EventManager";
import { Game } from "./Game";
import { PHY_GROUP } from "./Const";
let { ccclass, property } = _decorator
@ccclass
export default class Obstacle extends Component {

    collider: ColliderComponent = null

    onLoad() {
        
    }

    start() {
        this.collider = this.getComponent(ColliderComponent);
        this.collider.isTrigger = true;
        this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.collider.setGroup(PHY_GROUP.Obstacle);
        this.collider.setMask(PHY_GROUP.MoveCar);
    }

    onTriggerEnter(e) {
        // let t = director.getCurrentTime()
        // console.log(t);
        var collider = e.otherCollider as ColliderComponent;
        let car = collider.getComponent(Car);
        if (car) {
            //撞墙   0.5s触发一次（部分撞墙会撞到两个墙，用时间控制下）
            if (!Game.instance.bol) {
                Game.instance.bol = true;
                this.scheduleOnce(_ => {
                    Game.instance.bol = false;
                }, 0.5)
                evt.emit("Game.Trigger");

                Device.playSfx("car_hit")
                let v = car.moveEngine.velocity.clone()
                this.shake(v);
                car.playHitFx(v, -1);
                car.bounce(v);
                this.showTip();
                Device.vibrate();
            }
        }
    }


    shake(v: Vec3, c = 10) {
        let shakeComp = ccUtil.getOrAddComponent(this, HitShake)
        shakeComp.shake(v, c);
    }

    showTip() {
        if (UserInfo.tipIndex >= 10) UserInfo.tipIndex = 0;
        UserInfo.tipIndex += 1;
        let data = ccUtil.get(TipInfo, UserInfo.tipIndex);

        Device.playSfx("Event");
        Toast.make(data.txt);
    }
}