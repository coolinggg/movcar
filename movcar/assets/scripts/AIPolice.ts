import { _decorator, Component, Node, Vec2, Quat, ColliderComponent, v2 } from 'cc';
import MoveEngine from '../framework3D/misc/MoveEngine';
import Car from './Car';
import FSM from '../framework3D/core/FSM';
import MapLoader from './loader/MapLoader';
import Device from '../framework3D/misc/Device';
import { PHY_GROUP } from './Const';
const { ccclass, property } = _decorator;

enum State {
    Stop,
    Move,
    Kick,
}

@ccclass('AIPolice')
export class AIPolice extends Component {

    moveEngine: MoveEngine = null;
    _path: Vec2[] = []

    collider: ColliderComponent = null;

    fsm: FSM = null;

    _isDead = false;

    onLoad() {
        this.moveEngine = this.addComponent(MoveEngine);

        this.moveEngine.isPathPingPong = true;
        this.moveEngine.maxSpeed = 1;

       

        // test 
        // this._path = [v2(0, 0), v2(0, 1), v2(-1, 1), v2(-1, 0)]


        this.fsm = this.addComponent(FSM);
        this.fsm.init(this, State);
        this.fsm.enterState(State.Move);

    }

    start() {
        // Your initialization goes here.
        this.node.active = false;
        this.collider = this.getComponent(ColliderComponent);
        this.collider.setGroup(PHY_GROUP.Police);
        this.collider.setMask(PHY_GROUP.MoveCar);
        this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.collider.on("onTriggerExit", this.onTriggerExit, this);
        MapLoader.instance.onPathLoaded.on(this.onPathLoaded, this);
    }


    onPathLoaded(path: Vec2[]) {
        this._path = path;
        this.node.active = true;
        this.node.setPosition(path[0].x, 0, path[1].y)
    }


    get path() {
        return this._path;
    }

    update() {

    }

    onTriggerEnter(e) {
        let collider = e.otherCollider as ColliderComponent;
        let car = collider.getComponent(Car);
        if (car) {
            if (car.isMoving()) {
                //kick car 
                //TODO:需要判断 汽车与人的位置 
                Device.playSfx("car_hit")
                this.kickCar(car);
            } else {
                Device.playSfx("woman")
                this.stop();
            }
        }
    }

    onTriggerExit() {
        // if (this._isDead) return;
        this.fsm.changeState(State.Move);
    }


    onUpdate_Move() {
        if (this.path.length == 0) return;
        let force = this.moveEngine.followPath(this.path, 0.1, 0.1);
        this.moveEngine.addForce(force.multiplyScalar(1))
        // if (this.fsm.timeElapsed < 2.0) {
        this.node.rotation = Quat.slerp(this.node.rotation, this.node.rotation, this.moveEngine.rotationY, 0.2);
    }

    onEnter_Stop() {
        this.moveEngine.stop();
    }

    onUpdate_Stop() {

    }

    stop() {
        this.fsm.changeState(State.Stop)
    }

    kickCar(car: Car) {
        let v = car.moveEngine.velocity.clone();
        car.stop();
        // 击飞车,反方向
        this._isDead = true;
        // car.moveEngine.updateRotation();
        // 游戏失败
        car.flyAway(v);
    }

}
