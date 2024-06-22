import { _decorator, Component, Node } from 'cc';
import LoadingScene from './Base/LoadingScene';
const { ccclass, property } = _decorator;

@ccclass('Maints')
export class Maints extends Component {

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    click_play(){
        LoadingScene.goto("Game");
    }

}
cc.macro.ENABLE_WEBGL_ANTIALIAS = true