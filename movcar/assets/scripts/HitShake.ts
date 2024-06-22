import { Component, _decorator, Node, Vec3, v2, v3, tween, macro } from "cc";
import { EmotionType } from "./Emotion";
let { ccclass, property } = _decorator
@ccclass
export default class HitShake extends Component {
    strength: number = 1.5;
    shake(v: Vec3, deg = 0) {
        let angles = this.node.eulerAngles;
        //侧向被撞
        let vv = v2(v.x, v.z).rotate(angles.y * macro.RAD);
        let s = this.strength
        let vy = vv.y, vx = vv.x;
        if (deg > 0) {
            if (Math.abs(vv.x) > 1) {
                vx = Math.sign(vv.x) * deg;
            }
            if (Math.abs(vv.y) > 1) {
                vy = -Math.sign(vv.y) * deg;
            }
        } else {
            vy = vv.y * s
            vx = -vv.x * s
        }
        // console.log(vx, vy);
        this.node.eulerAngles = v3(vy, angles.y, vx);
        tween(this.node).to(0.3, { eulerAngles: v3(0, angles.y, 0) }, { easing: "elasticOut" }).start();
    }
}