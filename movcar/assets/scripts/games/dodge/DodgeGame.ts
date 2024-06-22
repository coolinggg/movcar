import { Component, _decorator, Node, systemEvent, SystemEventType, PhysicsSystem, instantiate, v3, director } from "cc";
import DodgePlayerCar from "./DodgePlayerCar";
import ccUtil from "../../../framework3D/utils/ccUtil";
import RemoveOutOfRange from "../common/RemoveOutOfRange";
import { evt } from "../../../framework3D/core/EventManager";
import PoolManager from "../../../framework3D/core/PoolManager";
import PoolSpawner from "../../../framework3D/misc/PoolSpawner";
import HpBar from "../../../framework3D/ui/controller/HpBar";
import DodgeLevel from "./DodgeLevel";
let { ccclass, property } = _decorator
let lanes = [-1, 0, 1]

const Barriers = [
    "Barrel", "Hydrant", "NewsBox", "TrafficCone", "Trash"
]

@ccclass
export default class DodgeGame extends Component {

    @property(DodgePlayerCar)
    car: DodgePlayerCar = null;

    spawner: PoolSpawner = null;

    @property(HpBar)
    hpbar: HpBar = null;

    level: DodgeLevel = null;

    onLoad() {
        PhysicsSystem.instance.enable = false;
        evt.on("LoseGame", this.onLoseGame, this);
        evt.on("WinGame", this.onWinGame, this);
        evt.on("HpChanged", this.onHpChanged, this);
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
        this.spawner = this.getComponent(PoolSpawner);
        Barriers.forEach(v => {
            this.spawner.preload(v, 'env/obstacles/' + v)
        })
        this.spawner.preload('end', 'env/obstacles/end')
        let c = DodgeLevel.current;
        this.hpbar.maxHp = c.life;
        this.hpbar.hp = c.life;
        this.level = c;
        this.car.speed = c.speed;

        window['game'] = this;
    }

    onHpChanged(c) {
        this.hpbar.hp = c;
    }


    onDestroy() {
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
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
        this.car.switchRoad();
    }

    start() {
        this.schedule(this.spawnObstacleRandom, this.level.interval_spawn)
        if (this.level.interval_spawn2 > 0) {
            this.schedule(this.spawnObstaclePlayer, this.level.interval_spawn2)
        }
        this.scheduleOnce(this.reachEnd, this.level.duration);

    }

    stopSpawn() {
        this.unschedule(this.spawnObstacleRandom);
        this.unschedule(this.spawnObstaclePlayer);
    }

    update() {

    }

    spawnObstacleRandom() {
        this.spawnObject(g.getRandom(lanes))
    }

    spawnObstaclePlayer() {
        let x = this.car.node.position.x
        this.spawnObject(x)
    }

    //spawn obstacle on road base on the position of player car
    async spawnObject(lane = 0, path = null) {
        let name = g.getRandom(Barriers);
        // let randomPrefab = await ccUtil.getPrefab()
        // let barrier = instantiate(randomPrefab) as Node;
        let barrier
        if (path == null) {
            barrier = PoolManager.get("Obstacles").get(name)
        } else {
            barrier = PoolManager.get("Obstacles").get(path);
        }
        // let rm = barrier.addComponent(RemoveOutOfRange)
        let rm = ccUtil.getOrAddComponent(barrier, RemoveOutOfRange);
        rm.target = this.car.node;
        rm.node.eulerAngles = v3(0, 0, 0);
        rm.onRemove.on(this.onObstacleRemove, this);
        barrier.setParent(this.node);
        let pos = this.car.node.position;
        barrier.setPosition(lane, 0, pos.z + 30);
    }

    onObstacleRemove(rm: RemoveOutOfRange) {
        PoolManager.get("Obstacles").put(rm.node);
    }

    reachEnd() {
        // this.stopSpawn();
        this.spawnObject(0, 'end')
        this.stopSpawn();
    }

}