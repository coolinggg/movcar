import { _decorator, Component, Enum, Vec3 } from "cc";
import PoolManager from "../../../framework3D/core/PoolManager";
import ObstacleCar, { Dir } from "./ObstacleCar";
import PoolSpawner from "../../../framework3D/misc/PoolSpawner";
import Utility from "../common/Utility";
import { AiCarNames } from "./StopGame";
import ccUtil from "../../../framework3D/utils/ccUtil";

const { ccclass, property } = _decorator;

@ccclass
export default class ObstacleCarSpawner extends Component {

    interval: number = 2;

    @property({ type: Enum(Dir) })
    dir: Dir = Dir.Left;

    speed: number = 5;



    onLoad() {

    }

    onEnable() {
        this.schedule(this.spawnCar, this.interval);
    }

    onDisable() {
        this.unschedule(this.spawnCar);
    }

    spawnCar() {
        let name = g.getRandom(AiCarNames)
        let node = PoolManager.get("Cars").get(name);
        let worldpos = this.node.worldPosition;
        node.position = worldpos;
        Utility.setRandomColor(node);
        let car = ccUtil.getOrAddComponent(node, ObstacleCar)
        car.dir = this.dir;
        car.speed = this.speed;
    }
}