import { Component, _decorator, Node, Vec2, v2 } from "cc";
let { ccclass, property } = _decorator
@ccclass
export default class MapPath extends Component {

    static data: Vec2[] = [];

    static instance: MapPath = null

    onLoad() {
        MapPath.instance = this;
        this.loadPath();
    }

    start() {

    }

    onDestroy(){
        MapPath.instance = null;
        MapPath.data.splice(0)
    }

    loadPath() {
        MapPath.data.splice(0)
        this.node.children.forEach((v) => {
            let p = v.worldPosition
            MapPath.data.push(v2(p.x, p.z))
        })
    }
}