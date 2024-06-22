import { _decorator, Component, Node, LabelComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIPause')
export class UIPause extends Component {

    @property(LabelComponent)
    str:LabelComponent = null;
    /* class member could be defined like this */

    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    click_pause(){

    }
    

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
