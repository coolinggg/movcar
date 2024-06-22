import { Component, _decorator, Node, director, ParticleSystemComponent } from "cc";
import Emotion, { EmotionType } from "../../Emotion";
import Mathf from "../../../framework3D/utils/Mathf";
import FizzBody, { FizzCollideInterface } from "../../../framework3D/extension/FizzX/FizzBody";
import ccUtil from "../../../framework3D/utils/ccUtil";
import FlyAway from "../common/FlyAway";
import { evt } from "../../../framework3D/core/EventManager";
import PoolManager from "../../../framework3D/core/PoolManager";
import { AllLayer } from "../common/AllLayer";
let { ccclass, property } = _decorator

@ccclass
export default class StopPlayerCar extends Component implements FizzCollideInterface {
    @property
    speed: number = 2;
    emotion: Emotion = null;
    _targetx = 0;
    hp: number = 3;

    hitFx: ParticleSystemComponent = null;

    onLoad() {
        this.emotion = this.getComponentInChildren(Emotion);
        this.hitFx = this.getComponentInChildren(ParticleSystemComponent);
        this.node.layer = AllLayer.Player;
    }

    start() {
        this.emotion.hide();
    }

    update(dt) {
        if (this._stop) return;
        let pos = this.node.position;
        this.node.setPosition(Mathf.Lerp(pos.x, this._targetx, 0.1), pos.y, pos.z + this.speed * dt);
    }

    toggleStop() {
        this._stop = !this._stop;
    }

    _stop = false;

    stop() {
        this._stop = true;
    }

    resume() {
        this._stop = false;
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // console.log(b);
        if (b.node.name == 'end') {
            // hit taget 
            evt.emit("WinGame")
            return;
        }
        let flyc = ccUtil.getOrAddComponent(b, FlyAway);
        flyc.fly(g.randomInt(0, 10), 0, -10);
        flyc.onGround.on(this.onGroud, this);
        this.emotion.show(EmotionType.Sad, 0.5)
        if (this.hitFx) {
            this.hitFx.play();
        }
        if (--this.hp <= 0) {
            this.stop();
            evt.emit("LoseGame")
        }
        evt.emit("HpChanged", this.hp)
    }
    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {
    }

    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number) {

    }

    onGroud(flyc: FlyAway) {
        PoolManager.get("Cars").put(flyc.node);
    }

}