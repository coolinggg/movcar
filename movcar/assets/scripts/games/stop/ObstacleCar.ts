import { Component, _decorator, ModelComponent, Vec3, v3, Quat, quat, macro } from "cc";
import Emotion from "../../Emotion";
import PoolManager from "../../../framework3D/core/PoolManager";
import { AllLayer } from "../common/AllLayer";
let { ccclass } = _decorator;
export enum Dir {
    Left,
    Right,
}
@ccclass
export default class ObstacleCar extends Component {
    speed: number = 5;
    private _dir: Dir = Dir.Left;
    public get dir(): Dir {
        return this._dir;
    }
    public set dir(value: Dir) {
        this._dir = value;
        this.dirSign = this.dir == Dir.Left ? 1 : -1;
        this.node.rotation = Quat.fromAxisAngle(quat(), Vec3.UP, this.dirSign * 90 * macro.RAD);
    }

    model: ModelComponent = null;
    emotion: Emotion = null;
    defaultScale: Vec3 = null;
    defaultRot: Quat = null;
    onLoad() {
        this.defaultScale = this.node.scale;
        this.defaultRot = this.node.rotation;
        this.model = this.getComponent(ModelComponent);
        this.model.shadowCastingMode = 1;
        this.emotion = this.getComponentInChildren(Emotion);
        this.emotion.hide();
        this.node.layer = AllLayer.Obstacle;

    }

    dirSign = 1;

    onEnable() {
        //reset rotation     
        this.node.scale = this.defaultScale
        this.node.rotation = this.defaultRot;
    }

    start() {

    }

    update(dt) {
        let pos = this.node.position;
        this.node.setPosition(pos.x + this.dirSign * this.speed * dt, pos.y, pos.z);
        if ((this.dir == Dir.Right && pos.x < -10) || (this.dir == Dir.Left && pos.x > 10)) {
            PoolManager.get("Cars").put(this.node);
        }
    }
}