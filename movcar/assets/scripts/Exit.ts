import { _decorator, Node, Component, ColliderComponent, Vec3, lerp, v3 } from "cc";
import ccUtil from "../framework3D/utils/ccUtil";
import Car from "./Car";
import { EmotionType } from "./Emotion";
import { evt } from "../framework3D/core/EventManager";
import Device from "../framework3D/misc/Device";
import { PHY_GROUP } from "./Const";

let { ccclass, property } = _decorator
@ccclass
export default class Exit extends Component {

    @property(Node)
    handler: Node = null

    targetAngle: number = 0;

    collider: ColliderComponent = null;

    onLoad() {
        

    }

    start() {
        this.collider = this.getComponent(ColliderComponent);
        this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.collider.setGroup(PHY_GROUP.Exit)
        this.collider.setMask(PHY_GROUP.RoadCar);
    }


    onTriggerEnter(e) {
        var collider = e.otherCollider as ColliderComponent;
        if (collider) {
            // open the door
            let car = collider.getComponent(Car);
            if (car) {
                this.openDoor(car);
                car.emotion.show(EmotionType.Happy);
            }
        }
    }


    openDoor(car) {
        this.targetAngle = 90;
        this.unschedule(this.closeDoor);
        this.scheduleOnce(this.closeDoor, 1);
        evt.emit("Exit.openDoor", car)
        Device.playSfx("car_drift");
        Device.vibrate();
    }

    closeDoor() {
        this.targetAngle = 0;
    }


    update() {
        let cur = this.handler.eulerAngles.z;
        this.handler.eulerAngles = v3(0, 0, lerp(cur, this.targetAngle, 0.1));
    }


}