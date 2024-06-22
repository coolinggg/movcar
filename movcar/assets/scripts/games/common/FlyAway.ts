import { Component, _decorator, Node, Quat, randomRangeInt, randomRange, quat, Vec3, v3, lerp } from "cc";
import MoveEngine from "../../../framework3D/misc/MoveEngine";
import Mathf from "../../../framework3D/utils/Mathf";
import Signal from "../../../framework3D/core/Signal";
let { ccclass, property } = _decorator
const gravity: Vec3 = v3(0, -0.4, 0);
@ccclass
export default class FlyAway extends Component {

    moveEngine: MoveEngine = null;
    onGround: Signal = new Signal();

    @property
    flooY: number = -0.1;

    onLoad() {
        this.moveEngine = this.addComponent(MoveEngine);
    }

    start() {

    }

    onEnable() {
        this.moveEngine.stop();
    }

    onDisable() {
        this.onGround.clear();
    }

    once: boolean = false;

    _crash_rotate: Quat = Quat.fromEuler(quat(), 0, 0, 0)

    fly(x = 10, y = 0, z = 0) {
        this.once = true;
        this.moveEngine.velocity = cc.v3(0, 100, 200)
        Quat.fromEuler(this._crash_rotate, x, y, z)
    }

    update(dt) {
        this.fly_update(dt);
    }

    timeElapsed: number = 1;

    private fly_update(dt) {
        if (this.once) {
            if (this.node.position.y < -0.1) {
                this.once = false;
                this.onGround.fire(this);
                return;
            }
            this.timeElapsed += dt;
            this.node.rotate(this._crash_rotate)
            this.moveEngine.addForce(gravity)
        }
    }

}