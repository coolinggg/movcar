import { Vec2, v2, ModelComponent, Material, _decorator, Component, v4 } from "cc";

let { ccclass, property } = _decorator
@ccclass
export default class Tiling extends Component {

    @property
    _preview: boolean = false;

    @property(Vec2)
    vel: Vec2 = v2(1, 0);

    @property(Vec2)
    tile: Vec2 = v2(10, 10);

    @property
    random = false;

    @property
    interval = 0;

    @property
    propertyName: string = "tilingOffset"


    _mat: Material = null

    onLoad() {
        let renderer = this.getComponent(ModelComponent);
        this._mat = renderer.material
    }

    start() {
        if (this.random) {
            this.changeDir()
        }
        if (this.interval > 0) {
            this.schedule(this.changeDir, this.interval)
        }
    }

    changeDir() {
        Vec2.random(this.vel);
    }

    offsetx = 0;
    offsety = 0;

    update(dt) {
        this.offsetx += this.vel.x * dt
        this.offsety += this.vel.y * dt
        this.offsetx = this.offsetx % 1.0;
        this.offsety = this.offsety % 1.0;
        this._mat.setProperty(this.propertyName, v4(this.tile.x, this.tile.y, this.offsetx, this.offsety))
    }
}