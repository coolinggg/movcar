import Switcher from "../../ui/controller/Switcher";
import WeakNetGame from "./WeakNetGame";
import mvc_View from "../../ui/mvc_View";

let { ccclass, property } = cc._decorator
@ccclass
export default class IconSov extends mvc_View {
    icon: Switcher = null

    @property
    sovName: string = ""

    onLoad() {
        this.icon = this.getComponent(Switcher);
        this.register(this.icon, () => WeakNetGame.getChoice(this.sovName))
        // this.onVisible(this.icon.node, () => wegame.getStatus(CloudFuncType.ShareVideoIcon) == 0)
    }

}