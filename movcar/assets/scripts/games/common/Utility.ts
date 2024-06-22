import { ModelComponent, Node, Material } from "cc";
import ccUtil from "../../../framework3D/utils/ccUtil";

const { ccclass, property } = cc._decorator;
const color_types = [2, 3, 4, 5, 6, 7]
@ccclass
export default class Utility {


    static setCarColor(node: Node, type: number) {
        let model: ModelComponent = node.getComponent(ModelComponent);
        ccUtil.getRes("env/mat_color/mat_" + type, Material).then(v => {
            model.material = v;
        })
    }

    static setRandomColor(node: Node) {
        let type = g.getRandom(color_types);
        this.setCarColor(node, type);
    }

}