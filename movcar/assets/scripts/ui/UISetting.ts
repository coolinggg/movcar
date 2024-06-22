import { _decorator, Component, Node, ToggleComponent } from 'cc';
import Device from '../../framework3D/misc/Device';
import { SettingInfo } from '../../framework3D/extension/weak_net_game/SettingInfo';
const { ccclass, property } = _decorator;

@ccclass('UISetting')
export class UISetting extends Component {

    @property(ToggleComponent)
    cb_music: ToggleComponent = null

    @property(ToggleComponent)
    cb_effect: ToggleComponent = null

    @property(ToggleComponent)
    cb_vibrate: ToggleComponent = null
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    
    onShow() {
        this.cb_effect.isChecked = !Device.isSfxEnabled;
        this.cb_music.isChecked = !Device.isBgmEnabled;
        this.cb_vibrate.isChecked = !Device.isVibrateEnabled;

        //pause all timer 
    }

    check_bgm(t: ToggleComponent) {
        Device.setBGMEnable(!t.isChecked)
        this.saveSettings()
    }

    check_sfx(t) {
        Device.setSFXEnable(!t.isChecked)
        this.saveSettings()
    }

    check_vibrate(t) {
        Device.setVibrateEnable(!t.isChecked)
        this.saveSettings()
    }

    saveSettings() {
        SettingInfo.saveSettings();
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
