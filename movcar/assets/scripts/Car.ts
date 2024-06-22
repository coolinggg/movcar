import { Component, _decorator, Vec3, Quat, ColliderComponent, AnimationComponent, Vec2, v2, ParticleSystemComponent, RigidBodyComponent, macro, v3, tween, PhysicsSystem, geometry, Material, ModelComponent } from "cc";
import MoveEngine from "../framework3D/misc/MoveEngine";
import { Game } from "./Game";
import FSM from "../framework3D/core/FSM";
import Emotion, { EmotionType } from "./Emotion";
import ccUtil from "../framework3D/utils/ccUtil";
import MapPath from "./MapPath";
import HitShake from "./HitShake";
import { PHY_GROUP } from "./Const";
import Device from "../framework3D/misc/Device";
import { evt } from "../framework3D/core/EventManager";
let { ccclass, property } = _decorator;
enum State {
    Stop,
    ToRoadStop,
    ToRoad,
    Road,
    FlyAway,
    Bounce,
}

@ccclass
export default class Car extends Component {

    moveEngine: MoveEngine = null

    fsm: FSM = null;

    collider: ColliderComponent = null

    emotion: Emotion = null;

    hitFx: ParticleSystemComponent = null;

    body: RigidBodyComponent = null;

    shakeComp: HitShake = null;

    model: ModelComponent = null;



    onLoad() {
        this.moveEngine = this.addComponent(MoveEngine)
        this.moveEngine.setWorldSpace(true);
        this.moveEngine.maxSpeed = 15;
        this.moveEngine.isPathLoop = false;
        this.collider = this.getComponent(ColliderComponent);
     
        this.fsm = this.addComponent(FSM)
        this.fsm.init(this, State);
        this.fsm.enterState(State.Stop);

        

        this.emotion = this.getComponentInChildren(Emotion);
        

        this.hitFx = this.getComponentInChildren(ParticleSystemComponent);

        this.model = this.getComponent(ModelComponent);

    }

    set color(v) {
        ccUtil.getRes("env/mat_color/mat_" + v, Material).then(v => {
            this.model.material = v;
        })
    }

    start() {
        
        this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.emotion.hide();
    }

    onDestroy() {
        console.log("destroy car !")
    }

    shake(v: Vec3) {
        this.shakeComp = ccUtil.getOrAddComponent(this, HitShake)
        this.shakeComp.shake(v);
        this.emotion.show(EmotionType.Sad);
    }

    playHitFx(v: Vec3, s = 1) {
        if (this.fsm.isInState(State.Stop)) return;
        let b = this.checkIsBackward(v)
        if (b) {
            this.hitFx.node.position = v3(0, 0, -1 * s);
        } else {
            this.hitFx.node.position = v3(0, 0, 1 * s);
        }
        if (this.hitFx) {
            this.hitFx.play();
        }
    }

    resumeInRoad() {
        this.fsm.changeState(State.Road);
    }

    onTriggerEnter(e) {
        if (this.fsm.isInState(State.Stop)) return;
        var collider = e.otherCollider as ColliderComponent;
        let car = collider.getComponent(Car);
        if (car) {
            if (car.isInRoad()) {
                //TODO: lose game //
                Device.playSfx("CarHorn")
                car.stop();
                car.scheduleOnce(car.resumeInRoad, 0.5);
            } else {
                //撞击它车
                evt.emit("Game.Trigger");
                Device.playSfx("car_hit");
                Device.vibrate();
                let v = this.moveEngine.velocity.clone()
                car.shake(v);
                this.playHitFx(v);
                this.stop();
                this.moveEngine.resume();
                this.moveEngine.velocity = v.multiplyScalar(-0.3);
            }

        } else {
        }
    }

    onEnter_Stop() {
        this.collider.setGroup(PHY_GROUP.StopCar);
        this.collider.setMask(PHY_GROUP.MoveCar);
        this.collider.isTrigger = false;
        this.moveEngine.damping = 0.9;
        this.moveEngine.pause();
    }

    onExit_Stop() {
        this.moveEngine.damping = 0.98;
        this.moveEngine.resume();
    }

    onUpdate_Stop() {
        // snap to grid pos;

    }

    isMoving() {
        return this.fsm.isInState(State.ToRoad) || this.fsm.isInState(State.Road);
    }

    isInRoad() {
        return this.fsm.isInState(State.Road);
    }


    stop() {
        this.fsm.changeState(State.Stop);
    }

    bounce(v, decay = 0.3) {
        v.multiplyScalar(-decay);
        // this.scheduleOnce(() => {
        this.fsm.changeState(State.Bounce, v)
    }

    onEnter_Bounce(state, v) {
        this.moveEngine.damping = 0.9;
        this.moveEngine.stop();
        this.moveEngine.velocity = v;
    }

    onExit_Bounce(state) {
        this.moveEngine.damping = 0.97;
    }

    onUpdate_Bounce(state) {
        if (this.fsm.timeElapsed > 0.5) {
            this.fsm.changeState(State.Stop);
        }
    }

    onEnter_ToRoad() {
        this.collider.setGroup(PHY_GROUP.MoveCar);
        this.collider.setMask(PHY_GROUP.Obstacle + PHY_GROUP.StopCar + PHY_GROUP.Police);
        this.collider.isTrigger = true;
    }

    onUpdate_ToRoad() {
        this.moveEngine.velocity.multiplyScalar(1.5);
        let path = MapPath.data;
        let idx = -1;
        let pos = this.node.position;
        if (pos.z <= path[0].y) {
            //ok
            idx = 0;
        } else if (pos.z > path[4].y) {
            idx = 4;
        }
        else if (pos.x > path[2].x) {
            idx = 2;
        } else if (pos.x < path[6].x) {
            idx = 6;
        }
        if (idx >= 0) {
            this.moveEngine.currentPathIndex = idx;
            this.fsm.changeState(State.Road);
            return;
        }
        /// check 检测前方是否有车
        let dir = this.moveEngine.velocityNormalized;
        let p = this.node.position.clone().add3f(0, 0.5, 0);
        let ray = new geometry.Ray();
        ray.o = p;
        ray.d = dir;
        let b = this.checkForward(ray);
        // if (!b) {
        //     let v = v2(dir.x, dir.y).rotate(macro.RAD * 30)
        //     ray.d = v3(v.x, 0, v.y);
        //     b = this.checkForward(ray);
        //     if (!b) {
        //         let v = v2(dir.x, dir.y).rotate(macro.RAD * -30)
        //         ray.d = v3(v.x, 0, v.y);
        //         b = this.checkForward(ray);
        //     }
        // }
    }

    // check

    checkForward(ray) {
        //是否有车
        let ok = PhysicsSystem.instance.raycast(ray, 0xffffffff, 3)
        if (ok) {
            let rs = PhysicsSystem.instance.raycastResults;
            let r = rs.find(v => v.collider != this.collider);
            if (r && r.collider) {
                let car = r.collider.getComponent(Car);
                if (car) {
                    if (car.isMoving()) {
                        // this.stop();
                        this.fsm.changeState(State.ToRoadStop, ray)
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lastRay: geometry.ray = null;
    onEnter_ToRoadStop(state, ray) {
        this.lastRay = ray;
        this.collider.isTrigger = false;
        this.moveEngine.stop();
        this.emotion.show(EmotionType.Sad);

    }

    onUpdate_ToRoadStop() {
        //0.5s 后开始检测 前方是否有车
        if (this.fsm.timeElapsed < 0.5) return;
        this.lastRay.o = this.node.position.clone().add3f(0, 0.5, 0);
        let canotpass = this.checkForward(this.lastRay);
        if (!canotpass) {
            this.moveEngine.velocity = this.lastRay.d.clone();
            this.moveEngine.velocity.multiplyScalar(this.moveEngine.maxSpeed / 2)
            this.fsm.changeState(State.ToRoad);
        }
    }

    onEnter_Road() {
        Device.playSfx("car_engine1");
        this.moveEngine.stop();
        this.moveEngine.damping = 1
        this.collider.isTrigger = false;

        // cc.log(`tag: ${this.node['_tag']}`);
        evt.emit('guide.finger', this.node['_tag']);
        this.collider.setGroup(PHY_GROUP.RoadCar);
        this.collider.setMask(PHY_GROUP.Exit);
    }

    onExit_Road() {
    }

    onUpdate_Road() {
        // let idx = this.moveEngine.currentPathIndex;
        let force = this.moveEngine.followPath(MapPath.data);
        this.moveEngine.addForce(force.multiplyScalar(0.2))
        this.node.rotation = Quat.slerp(this.node.rotation, this.node.rotation, this.moveEngine.rotationY, 0.2);
        let pos = this.node.position;
        if (pos.z < - 22) {
            //超出屏幕
            this.node.destroy();
        }
    }

    //路径行驶 
    startMove(initDir: Vec3) {
        if (this.isMoving()) {
            return;
        }
        let angleY = this.node.eulerAngles.y;
        if (angleY == 0 || angleY == 180) {
            if (initDir.x != 0) {
                // console.log("无法侧方移动")
                return;
            }
        } else if (angleY == 90) {
            if (initDir.z != 0) {
                // console.log("无法侧方移动")
                return;
            }
        }

        this.moveEngine.velocity = initDir;

        this.fsm.changeState(State.ToRoad);
    }


    update() {

    }

    _flyAway() {
        this.fsm.changeState(State.FlyAway)
    }

    /**判断 是否是在倒车 */
    checkIsBackward(v) {
        let ey = this.node.eulerAngles.y * macro.RAD;
        //车辆当前方向
        let vec = v2(Math.sin(ey), Math.cos(ey))
        // console.log('车辆当前方向' + vec);
        //车方向和车速度如果差距夹角太大，则表示在倒车
        let angle = v2(v.x, v.z).angle(vec);
        return angle > 3
    }

    _flyAwayDir = 1;

    async flyAway(v: Vec3) {
        this.moveEngine.pause();
        this.scheduleOnce(this._flyAway, 0.1);
        // this.fsm.changeState(State.FlyAway)
        this._flyAwayDir = 1
        if (this.checkIsBackward(v)) {
            this._flyAwayDir = -1
        }
        if (Game.instance.isOver) return;
        Game.instance.isOver = true;
        await evt.sleep(2.5);
        evt.emit("Game.lose")
    }


    onEnter_FlyAway() {
        this.enablePhsyics();
        this.moveEngine.pause();
        let dir = v2(0, 0.5 * this._flyAwayDir)
        // dir.rotate(this.node.eulerAngles.y * macro.RAD);
        let pos = cc.v3(dir.x, 0, dir.y);
        this.body.applyLocalForce(cc.v3(g.randomInt(-3000, 3000), 10000, -dir.y * 10000), pos);
    }

    onUpdate_FlyAway() {

    }


    enablePhsyics() {
        PhysicsSystem.instance.maxSubSteps = 1;
        PhysicsSystem.instance.fixedTimeStep = 1 / 50;
        this.body = ccUtil.getOrAddComponent(this, RigidBodyComponent);
        this.body.setGroup(PHY_GROUP.FlyCar);
        this.body.setMask(PHY_GROUP.Ground)
    }

    isInFlyAway() {
        return this.fsm.isInState(State.FlyAway);
    }
}