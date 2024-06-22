import { _decorator, Component, Node, systemEvent, SystemEventType, PhysicsSystem, geometry, CCObject, CameraComponent, Vec2, v2, Vec3, v3 } from 'cc';
import Car from './Car';
import MapLoader from './loader/MapLoader';
import { evt } from '../framework3D/core/EventManager';
import vm from '../framework3D/ui/vm';
import Device from '../framework3D/misc/Device';
import Platform from '../framework3D/extension/Platform';
import { UIGame } from './ui/UIGame';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    cars: Car[] = []

    @property(CameraComponent)
    camera: CameraComponent = null;

    @property(UIGame)
    UIGame: UIGame = null;

    static instance: Game = null;
    isRevived: boolean = false;
    private _maxDistance: number = 100;
    private _mask: number = 0xffffffff;
    isOver: boolean = false;
    bol: boolean = false;
    onLoad() {
        evt.on("Game.win", this.onWin, this);
        evt.on("Game.lose", this.onLose, this);

    }

    start() {
        PhysicsSystem.instance.enable = true;
        PhysicsSystem.instance.maxSubSteps = 0.1;
        PhysicsSystem.instance.fixedTimeStep = 1 / 10;
        PhysicsSystem.instance.gravity = v3(0, -30, 0);

        Game.instance = this;
        // Your initialization goes here.
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        systemEvent.on(SystemEventType.TOUCH_MOVE, this.onTouchMove, this)
        systemEvent.on(SystemEventType.TOUCH_CANCEL, this.onTouchCancel, this)
        evt.on("Exit.openDoor", this.onCarExit, this)
        MapLoader.instance.onCarsLoaded.on(this.onAllCarsLoaded, this);

        Platform.loadSubPackage("Audio").then(v => {
            Device.playBGM("bgm")
        })
        this.isOver = false;
        this.isRevived = false;
    }


    onDestroy() {
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this)
        systemEvent.off(SystemEventType.TOUCH_MOVE, this.onTouchMove, this)
        systemEvent.off(SystemEventType.TOUCH_CANCEL, this.onTouchCancel, this)
        evt.off(this);
    }

    onCarExit(car: Car) {
        this._cars.splice(this._cars.indexOf(car), 1)
        if (this._cars.length == 0) {
            // level clear 
            evt.emit("Game.win");
        }
    }

    onAllCarsLoaded(loader: MapLoader) {
        this._cars = loader.cars.map(v => v.getComponent(Car))
    }


    private _ray: geometry.Ray = new geometry.Ray();
    _selectedCar: Car = null
    _startPoint: Vec2

    _cars: Car[] = []

    onTouchStart(e) {
        // e.getUILocation()
        let pos = e.getUILocation();
        //Game.win
        this.camera.screenPointToRay(e._point.x, e._point.y, this._ray);
        let ok = PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this._maxDistance)
        if (ok) {
            const item = PhysicsSystem.instance.raycastClosestResult;
            const car = item.collider.node.getComponent(Car);
            this._selectedCar = car;
        }
        this._startPoint = pos;
    }


    checkDir(v): Vec3 {
        if (v.x < 0) {
            if (v.y < 0) {
                // 向上
                return cc.v3(0, 0, -1)
            } else {
                // 向右
                return cc.v3(1, 0, 0)

            }
        } else {
            if (v.y < 0) {
                // 向左
                return cc.v3(-1, 0, 0)
            } else {
                // 向下
                return cc.v3(0, 0, 1)
            }
        }

    }

    onTouchEnd(e) {
        if (this._selectedCar) {
            let pos = e.getUILocation();
            let v = this._startPoint.subtract(pos);
            // console.log(v);
            // this._selectedCar.startMove();
            let dir = this.checkDir(v)
            this._selectedCar.startMove(dir);
        }
        this._selectedCar = null
    }

    onTouchMove() {

    }

    onTouchCancel() {
        this._selectedCar = null

    }

    onWin() {
        Device.playSfx("win")
        console.log("22222222");
        vm.show("prefab/ui/UIWin");
    }

    onLose() {
        Device.playSfx("lose")
        vm.show("prefab/ui/UILose", "level");
    }

    receive() {

        let arr = new Array();
        arr = this._cars;
        arr.forEach(e => {
            if (e.isInFlyAway()) {
                this._cars.splice(this._cars.indexOf(e), 1);
                e.node.destroy();
                if (this._cars.length == 0) {
                    // level clear 
                    evt.emitDelay(1, "Game.win");
                }
            }
        })
        this.isOver = false;
        this.isRevived = true;
    }


}
