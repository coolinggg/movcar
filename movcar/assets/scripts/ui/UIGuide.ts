import { _decorator, Component, Node, tween } from 'cc';
import { PlayerInfo } from '../Base/PlayerInfo';
import { evt } from '../../framework3D/core/EventManager';



const { ccclass, property } = _decorator;

@ccclass('UIGuide')
export class UIGuide extends Component {

    @property({ type: Node })
    finger1: Node = null;

    @property({ type: Node })
    finger2: Node = null;

    @property({ type: Node })
    finger3: Node = null;

    cars = [6, 2, 4];

    start() {
        // Your initialization goes here.
        this.node.active = PlayerInfo.level === 1;
        this.finger1.active = true;
    }

    onEnable() {
        // tween(this.finger1)
        //     .repeatForever(tween()
        //         .by(0.4, { position: cc.v3(-144, 0, 0)})//, color: '#FFFFFFA0'
        //         .by(0.17, { position: cc.v3(-22, 0, 0)}) //, color: '#FFFFFF50'
        //         .by(0.18, { position: cc.v3(-54, 0, 0)})
        //     ).start(); //, color: '#FFFFFF00'

        evt.on('guide.finger', this.onFinger, this);
    }

    onDisable() {
        evt.off('guide.finger', this.onFinger, this);
    }

    onFinger(gid: number) {

        let index = this.cars.indexOf(gid);
        if (index > -1) {
            this.cars[index] = -1;

            if (this[`finger${index + 1}`]) {
                this[`finger${index + 1}`].active = false;
            }

            for (let i = 0; i < this.cars.length; i++) {
                if (this.cars[i] !== -1) {
                    if (this[`finger${i + 1}`]) {
                        this[`finger${i + 1}`].active = true;
                    }
                    break;
                }
            }
        }
    }

}
