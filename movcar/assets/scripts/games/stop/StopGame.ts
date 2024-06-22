import { Component, _decorator, Node, systemEvent, SystemEventType, PhysicsSystem, instantiate, v3, director } from "cc";
import ccUtil from "../../../framework3D/utils/ccUtil";
import RemoveOutOfRange from "../common/RemoveOutOfRange";
import { evt } from "../../../framework3D/core/EventManager";
import PoolManager from "../../../framework3D/core/PoolManager";
import PoolSpawner from "../../../framework3D/misc/PoolSpawner";
import HpBar from "../../../framework3D/ui/controller/HpBar";
import StopPlayerCar from "./StopPlayerCar";
import FizzManager from "../../../framework3D/extension/FizzX/FizzManager";
import { AllLayer } from "../common/AllLayer";
let { ccclass, property } = _decorator

export const AiCarNames = [
    "2x3", "2x4", "2x5"
]

@ccclass
export default class StopGame extends Component {

    @property(StopPlayerCar)
    car: StopPlayerCar = null;

    spawner: PoolSpawner = null;

    @property(HpBar)
    hpbar: HpBar = null;


    onLoad() {
        PhysicsSystem.instance.enable = false;
        evt.on("LoseGame", this.onLoseGame, this);
        evt.on("WinGame", this.onWinGame, this);
        evt.on("HpChanged", this.onHpChanged, this);
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        this.spawner = this.getComponent(PoolSpawner);
        AiCarNames.forEach(v => {
            this.spawner.preload(v, 'env/cars/fizz/' + v)
        })
        // this.spawner.preload('end', 'env/obstacles/end')

        window['game'] = this;

        FizzManager.collisionMatrix[AllLayer.Obstacle][AllLayer.Obstacle] = 0;
        FizzManager.collisionMatrix[AllLayer.Player][AllLayer.Obstacle] = 1;
    }

    onHpChanged(c) {
        // this.hpbar.hp = c;
    }


    onDestroy() {
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        evt.off(this);
    }

    onLoseGame() {
        this.stopSpawn();
    }

    onWinGame() {
        console.log("goal !!")
    }

    onTouchStart(e) {
        // let pos = e.getUILocation();
        this.car.stop();
    }

    onTouchEnd(e) {
        this.car.resume();
    }

    start() {
    }

    stopSpawn() {
    }

    update() {

    }



    onObstacleRemove(rm: RemoveOutOfRange) {
        PoolManager.get("Obstacles").put(rm.node);
    }

    reachEnd() {

    }

}