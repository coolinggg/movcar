import { _decorator, Component, Node, LabelComponent, AnimationComponent, SpriteComponent, Color, ToggleComponent } from 'cc';
import vm from '../../framework3D/ui/vm';
import { PlayerInfo } from '../Base/PlayerInfo';
import LoadingScene from '../Base/LoadingScene';
import { evt } from '../../framework3D/core/EventManager';
import Device from '../../framework3D/misc/Device';
import { SettingInfo } from '../../framework3D/extension/weak_net_game/SettingInfo';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
const { ccclass, property } = _decorator;

@ccclass('UIGame')
export class UIGame extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(LabelComponent)
    level: LabelComponent = null;

    @property(LabelComponent)
    trigger: LabelComponent = null;

    @property(AnimationComponent)
    setting: AnimationComponent = null;
    
    triggerNum:number = 0;
    _maxTriggerNum:number = 5;
    isShowSetting:boolean = false;

    get maxTriggerNum(){
        return this._maxTriggerNum;
    }


    set maxTriggerNum(num){
        this._maxTriggerNum = num;
        this.trigger.string = "撞击次数: " + this.triggerNum + "/" + this.maxTriggerNum;
    }

    onLoad(){
        evt.on("Game.Trigger", this.onTrigger, this);
    }

    start () {
        // Your initialization goes here.
        this.level.string = "关卡 - " + PlayerInfo.level;
        if(PlayerInfo.level >= 30){
            this.maxTriggerNum = 7;
        }
        this.setting.node.getComponentsInChildren(ToggleComponent).forEach(v =>{
            v.isChecked = !SettingInfo[v.node.name];
        })
        this.trigger.string = "撞击次数: " + this.triggerNum + "/" + this.maxTriggerNum;
    }

    onTrigger(){
        this.triggerNum += 1;
        this.trigger.string = "撞击次数: " + this.triggerNum + "/" + this.maxTriggerNum;
        if(this.triggerNum >= this.maxTriggerNum){
            evt.emit("Game.lose");
        }
    }

    click_return() {
        LoadingScene.goto("Game");
    }

    click_skip() {
        WeakNetGame.doChoice("SOV_Skip_Game", _=>{
            console.log("4444444444444");
            vm.show("prefab/ui/UIWin");
        }, this)
        
    }

    click_setting() {
        if(this.isShowSetting){
            this.isShowSetting = false;
            this.setting.node.getComponent(SpriteComponent).color = Color.WHITE;
            this.setting.play("hidesetting");
        }
        else{
            this.setting.node.getComponent(SpriteComponent).color = Color.GRAY;
            this.setting.play("setting");
            this.isShowSetting = true;
        }
    }

    onDestroy(){
        evt.off(this);
    }

    check_bgm(t: ToggleComponent) {
        Device.setBGMEnable(!t.isChecked)
        SettingInfo.saveSettings();
    }

    
    check_sfx(t) {
        Device.setSFXEnable(!t.isChecked);
        SettingInfo.saveSettings();
    }

    check_vibrate(t) {
        Device.setVibrateEnable(!t.isChecked);
        SettingInfo.saveSettings();
    }



    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
