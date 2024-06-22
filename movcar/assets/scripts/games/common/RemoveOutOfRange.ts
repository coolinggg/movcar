import { Component, _decorator, Node } from "cc";
import ccUtil from "../../../framework3D/utils/ccUtil";
import Signal from "../../../framework3D/core/Signal";
let { ccclass, property } = _decorator
@ccclass
export default class RemoveOutOfRange extends Component {

    target: Node = null;
    distanceThreshold: number = 10;
    onRemove: Signal = new Signal();

    onLoad() {

    }

    start() {

    }

    onDisable() {
        this.onRemove.clear();
    }

    update() {
        if (this.node.position.z - this.target.position.z < -this.distanceThreshold) {
            this.onRemove.fire(this);
        }
    }

}