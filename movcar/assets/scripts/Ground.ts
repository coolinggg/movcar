import { _decorator, Component, ColliderComponent } from "cc";
import { PHY_GROUP } from "./Const";

const { ccclass, property } = _decorator;

@ccclass
export default class Ground extends Component {


    start() {
        let collider = this.getComponent(ColliderComponent);
        collider.setGroup(PHY_GROUP.Ground)
        collider.setMask(PHY_GROUP.FlyCar);
    }
}