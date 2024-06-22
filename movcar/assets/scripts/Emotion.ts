import { _decorator, Component, Material, ModelComponent, BillboardComponent, Texture2D, tween, v3, isValid } from "cc";
import ccUtil from "../framework3D/utils/ccUtil";

const { ccclass, property, executeInEditMode } = _decorator;

export enum EmotionType {
    Happy,
    Sad,
}


@ccclass
@executeInEditMode()
export default class Emotion extends Component {

    _mat: Material = null

    billboard: BillboardComponent;

    onLoad() {
        let quad = this.getComponent(BillboardComponent);
        this.billboard = quad;
    }

    start() {
        if (this.billboard) {
            //@ts-ignore
            this._mat = this.billboard._material;
            this._mat.passes[0].blendState.targets[0].blendDst = 4;
        }
    }

    setType(type: EmotionType) {
        let name = 'Success'
        // this._mat.setProperty("diffuseTexture",texture);
        if (type == EmotionType.Happy) {

        } else {
            name = 'Fail'
            // ccUtil.setTexture(, '');
            // this.billboard.texture = 
        }

        ccUtil.getRes('textures/emotions/' + name + g.randomInt(1, 5) + "/texture", Texture2D).then( (v:Texture2D) => {
            if(this.billboard){
                //@ts-ignore
                this.billboard.texture = v;
            }
        })
    }

    show(type: EmotionType, scale = 1.5) {
        this.setType(type);
        this.node.active = true;
        this.billboard.width = 0;
        this.billboard.height = 0;
        tween(this.billboard).to(0.2, { width: scale, height: scale }, { easing: "sineOut" }).start();
        this.unschedule(this.hide);
        this.scheduleOnce(this.hide, 1)
    }

    hide() {
        tween(this.billboard).to(0.2, { width: 0, height: 0 }, { easing: "sineOut" }).call(() => {
            if (isValid(this.node)) {
                this.node.active = false;
            }
        }).start();
    }

}