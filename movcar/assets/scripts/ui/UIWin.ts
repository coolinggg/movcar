import { _decorator, Component, Node, LabelComponent, ParticleSystemComponent, AnimationComponent } from 'cc';
import { PlayerInfo } from '../Base/PlayerInfo';
import vm from '../../framework3D/ui/vm';
import LoadingScene from '../Base/LoadingScene';
import ccUtil from '../../framework3D/utils/ccUtil';
import TipInfo from '../Data/TipInfo';
import Device from '../../framework3D/misc/Device';
const { ccclass, property } = _decorator;

@ccclass('UIWin')
export class UIWin extends Component {

    @property(LabelComponent)
    str: LabelComponent = null;

    @property(LabelComponent)
    tips: LabelComponent = null;

    @property(Node)
    caidai: Node = null;

    @property(AnimationComponent)
    emotion: AnimationComponent = null;

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    _str: string = "";

    start() {
        // Your initialization goes here.
    }

    onShow(str) {
        let level = str ? PlayerInfo[str] : PlayerInfo.level;
        this.str.string = "恭喜你通过第" + level + "关";//[str] 

        str ? PlayerInfo[str] += 1 : PlayerInfo.level += 1 //
        PlayerInfo.save();
        ccUtil.playParticles(this.caidai);
        Device.playSfx("Confetti");
        let data = ccUtil.get(TipInfo, g.randomInt(1, csv.Tip.size));
        this.tips.string = data.txt;
        this.emotion.play();
        this._str = str;
    }

    click_next() {
        vm.hide(this);
        if (this._str == "level_turn") {
            LoadingScene.goto("Game_turn");
        }
        else {
            LoadingScene.goto("Game");
        }
    }

    click_back() {

    }


    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
