import { _decorator, Component, Node, systemEvent, SystemEventType, PhysicsSystem, geometry, Vec2, CameraComponent, instantiate, Prefab, v3, Vec3, Quat } from 'cc';
import { evt } from '../framework3D/core/EventManager';
import Car2 from './Car2';
import LevelInfo from './Data/LevelInfo';
import ccUtil from '../framework3D/utils/ccUtil';
import { PlayerInfo } from './Base/PlayerInfo';
import vm from '../framework3D/ui/vm';
import Device from '../framework3D/misc/Device';
const { ccclass, property } = _decorator;

@ccclass('Game_turn')
export class Game_turn extends Component {

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(Node)
    carsNode: Node = null;

    @property(Prefab)
    prefab: Prefab = null;

    @property(Node)
    carsComputer: Node = null;


    @property(CameraComponent)
    camera: CameraComponent = null;

    _cars: Car2[] = [];
    _selectedCar: Car2 = null
    private _maxDistance: number = 100;
    private _mask: number = 0xffffffff;
    private _ray: geometry.ray = new geometry.ray();
    _startPoint: Vec2;
    carid: number = 0;
    destoryCarNum: number = 0;

    carGroup: number = 0;

    isover: boolean = false;


    onLoad() {
        evt.on("game_turn.lose", this.lose, this);
    }

    start() {
        PhysicsSystem.instance.enable = true;
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        this.randomCar();
        this.schedule(this.randomCar, 5);
        this.initialize();
        this._cars = this.carsNode.children[this.carGroup].getComponentsInChildren(Car2);
    }

    initialize() {
        let data = ccUtil.get(LevelInfo, PlayerInfo.level_turn);
        let posx = -1;
        for (let i = 0; i < data.configure.length; i++) {
            let num = parseInt(data.configure[i]);
            posx *= -1;
            if (num <= 0)
                return;
            for (let j = 0; j < num; j++) {
                let node = instantiate(this.prefab) as Node;
                node.parent = this.carsNode.children[i];
                node.setPosition(posx * (4 + 5 * j), 0, -10 * i);
                node.setRotationFromEuler(0, -90 * posx, 0);
            }
        }
    }

    win() {
        if (this.isover)
            return;
        this.isover = true;
        Device.playSfx("win");
        console.log("111111111");
        vm.show("prefab/ui/UIWin", "level_turn");
    }

    lose() {
        if (this.isover)
            return;
        this.isover = true;
        Device.playSfx("lose")
        vm.show("prefab/ui/UILose", "level_turn");
    }

    async randomCar() {
        let random = Math.ceil(Math.random() * 3);
        for (let i = 0; i < random; i++) {
            let node = instantiate(this.prefab) as Node;
            node.parent = this.carsComputer;
            node.getComponent(Car2).startMoveGame2(cc.v3(0, 0, 1));
            await evt.sleep(0.5);
        }

    }

    onDestroy() {
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        this.unscheduleAllCallbacks();
        evt.off(this);
    }

    async onTouchStart(e) {
        if (!this.carsNode.children[this.carGroup]) {
            return;
        }
        let pos = e.getUILocation();
        this._selectedCar = this._cars[this.carid];
        this._startPoint = pos;
        this.unscheduleAllCallbacks();

        for (let i = this.carid + 1; i < this._cars.length; i++) {
            if (this._selectedCar.node.position.x > 0 && this._cars[i].node.position.x > 0) {
                let pos = this._cars[i].node.position.x - 5;
                this.schedule(_ => {
                    if (this._cars[i].node.position.x >= pos) {
                        this._cars[i].node.setPosition(cc.v3(this._cars[i].node.position.x - 0.1, this._cars[i].node.position.y, this._cars[i].node.position.z));
                    }
                }, 0, 50);
            }
            else if (this._selectedCar.node.position.x < 0 && this._cars[i].node.position.x < 0) {
                let pos = this._cars[i].node.position.x + 5;
                this.schedule(_ => {
                    if (this._cars[i].node.position.x <= pos) {
                        this._cars[i].node.setPosition(cc.v3(this._cars[i].node.position.x + 0.1, this._cars[i].node.position.y, this._cars[i].node.position.z));
                    }
                }, 0, 50);
            }
        }

        if (this.carid >= this._cars.length - 1) {
            this.carGroup += 1;
            this.carid = 0;
            this.schedule(_ => {
                this.camera.node.setPosition(this.camera.node.position.x, this.camera.node.position.y + 0.1, this.camera.node.position.z);
            }, 0, 50);
            if (this.carsNode.children[this.carGroup]) {
                this._cars = this.carsNode.children[this.carGroup].getComponentsInChildren(Car2);
                if (this.carsNode.children[this.carGroup].children.length <= 0) {
                    await evt.sleep(0.8);
                    this.win();
                }
            }
        }
        else {
            this.carid += 1;
        }
    }

    onTouchEnd(e) {
        if (this._selectedCar) {
            this._selectedCar.startMoveGame2(cc.v3(0, 0, 1));
        }
        this._selectedCar = null
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
