import { Component, _decorator, Vec3, Quat, ColliderComponent, AnimationComponent, Vec2, v2, ParticleSystemComponent, RigidBodyComponent, macro, v3, tween, PhysicsSystem, geometry, Material, ModelComponent } from "cc";
import MoveEngine from "../framework3D/misc/MoveEngine";
import { Game } from "./Game";
import FSM from "../framework3D/core/FSM";
import Emotion, { EmotionType } from "./Emotion";
import ccUtil from "../framework3D/utils/ccUtil";
import MapPath from "./MapPath";
import HitShake from "./HitShake";
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
export default class Car2 extends Component {

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
        this.collider = this.getComponent(ColliderComponent);
        this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.emotion.hide();
    }

    onDestroy() {
        console.log("destroy car !");
    }

    shake(v: Vec3) {
        this.shakeComp = ccUtil.getOrAddComponent(this, HitShake)
        this.shakeComp.shake(v);
        this.emotion.show(EmotionType.Sad);
    }

    playHitFx(v: Vec3, s = 1) {
        if (this.fsm.isInState(State.Stop)) return;

        this.hitFx.node.position = v3(0, 0, 1 * s);
        if (this.hitFx) {
            this.hitFx.play();
        }
    }

    resumeInRoad() {
        this.fsm.changeState(State.Road);
    }

    onTriggerEnter(e) {
        this._flyAway();
        evt.emit("game_turn.lose")
        // var collider = e.otherCollider as ColliderComponent;
        // let car = collider.getComponent(Car2);
        // if (car) {
        //     if (car.isInRoad()) {
        //         //TODO: lose game //
        //         Device.playSfx("CarHorn")
        //         car.scheduleOnce(car.resumeInRoad, 0.5);
        //     } else {
        //         //撞击它车
        //         evt.emit("Game.Trigger");
        //         Device.playSfx("car_hit");
        //         Device.vibrate();
        //         let v = this.moveEngine.velocity.clone()
        //         car.shake(v);
        //         this.playHitFx(v);
        //         this.moveEngine.resume();
        //         this.moveEngine.velocity = v.multiplyScalar(-0.3);
        //     }

        // } else {
        // }
    }


    isMoving() {
        return this.fsm.isInState(State.ToRoad) || this.fsm.isInState(State.Road);
    }

    isInRoad() {
        return this.fsm.isInState(State.Road);
    }


    onUpdate_Bounce(state) {
        if (this.fsm.timeElapsed > 0.5) {
            this.fsm.changeState(State.Stop);
        }
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
        let ray = new geometry.ray();
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
                let car = r.collider.getComponent(Car2);
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


    onEnter_Road() {
        Device.playSfx("car_engine1");
        this.moveEngine.stop();
        this.moveEngine.damping = 1
    }

    onUpdate_Road() {
        // let idx = this.moveEngine.currentPathIndex;
        let force = this.moveEngine.followPath(MapPath.data);
        this.moveEngine.addForce(force.multiplyScalar(0.2))
        this.node.rotation = Quat.slerp(this.node.rotation, this.node.rotation, this.moveEngine.rotationY, 0.2);
        let pos = this.node.position;
        if (pos.z < - 50) {
            //超出屏幕
            this.node.destroy();
        }
    }


    startMoveGame2(initDir: Vec3) {
        if (this.isMoving()) {
            return;
        }
        // this.moveEngine.velocity = initDir;

        this.fsm.changeState(State.ToRoad);
    }



    _flyAway() {
        this.fsm.changeState(State.FlyAway)
    }

    _flyAwayDir = 1;

    async flyAway(v: Vec3) {
        this.moveEngine.pause();
        this.scheduleOnce(this._flyAway, 0.1);
        // this.fsm.changeState(State.FlyAway)
        this._flyAwayDir = 1
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
    }

    isInFlyAway() {
        return this.fsm.isInState(State.FlyAway);
    }
}