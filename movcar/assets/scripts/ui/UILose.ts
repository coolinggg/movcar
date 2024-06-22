import { _decorator, Component, LabelComponent, Node } from 'cc';
import LoadingScene from '../Base/LoadingScene';
import ccUtil from '../../framework3D/utils/ccUtil';
import TipInfo from '../Data/TipInfo';
import vm from '../../framework3D/ui/vm';
import { Game } from '../Game';

const { ccclass, property } = _decorator;

@ccclass('UILose')
export class UILose extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(Node)
    node_revive: Node = null;

    @property(LabelComponent)
    tips: LabelComponent = null;

    _str: string = "";

    start() {
        // Your initialization goes here.

    }

    onShow(str) {
        if ( str == "level_turn" ||Game.instance.isRevived ) {
            this.node_revive.active = false;
        }
        let data = ccUtil.get(TipInfo, g.randomInt(1, csv.Tip.size));
        this.tips.string = data.txt;
        this._str = str;
    }

    click_return() {
        if(this._str == "level_turn"){
            LoadingScene.goto("Game_turn");
        }
        else{
            LoadingScene.goto("Game");
        }
    }

    click_back() {
        if(this._str == "level_turn"){
            LoadingScene.goto("Game_turn");
        }
        else{
            LoadingScene.goto("Game");
        }
    }

    click_receive() {
        //复活
        Game.instance.UIGame.maxTriggerNum += 5;
        vm.hide(this);
        Game.instance.receive();
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
