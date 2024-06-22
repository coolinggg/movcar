import Tilemap from "../../framework3D/extension/TilemapX/Tilemap";
import { Component, _decorator, Rect, Prefab, instantiate, Node, v3, Vec2, v2, TerrainBuffer, WorldNode3DToLocalNodeUI } from "cc";
import ccUtil from "../../framework3D/utils/ccUtil";
import { TilemapData, TileLayerData } from "../../framework3D/extension/TilemapX/TilemapLoader";
import Signal from "../../framework3D/core/Signal";
import { PlayerInfo } from "../Base/PlayerInfo";
import Car from "../Car";

const { ccclass, property } = _decorator;

enum Gid {
    Wall = 1,
    Car,
    CarEnd = 7,
    Path = 8
}
const choice_rot = [0, 180]

const es = 1.13;

const Barriers = [
    "Barrel", "Hydrant", "NewsBox", "TrafficCone", "Trash"
]

const dir4 = [
    v2(0, 1),
    v2(1, 0),
    v2(-1, 0),
    v2(0, -1)
]

@ccclass
export default class MapLoader extends Component {
    tilemap: Tilemap = null;
    path: Vec2[] = []
    cars: Node[] = []
    static instance: MapLoader = null;
    onPathLoaded: Signal = new Signal();
    onCarsLoaded: Signal = new Signal();


    onLoad() {
        MapLoader.instance = this;
        this.tilemap = this.getComponent(Tilemap);
        this.tilemap.path = 'levels/' + PlayerInfo.level;
        this.tilemap.onLoaded.add(this.onLoaded, this);

    }


    async loadEnv(name) {
        console.log('load ' + name)
        let prefab = await ccUtil.getRes("env/" + name, Prefab)
        let node = instantiate(prefab) as Node
        node.parent = this.node;
    }

    onLoaded() {
        let name = this.tilemap.data.width + "x" + this.tilemap.data.height;
        this.loadEnv(name);
        let res = this.tilemap.findRectangles("layer")
        console.log(res);
        for (var k in res) {
            let r = res[k];
            let gid = Number(k);
            if (gid == Gid.Wall) {
                this.createWalls(r);
            } else if (gid >= Gid.Car && gid <= Gid.CarEnd) {
                this.createCars(r, gid);
            } else if (gid == Gid.Path) {
                this.createPath(r);
            }
        }
    }


    async createCars(rs: Rect[], gid = 0) {
        for (var i = 0; i < rs.length; i++) {
            let r = rs[i];
            let name = '2x'
            let rot = 90;
            if (r.width > 2) {
                // 旋转90
                name += r.width;
            } else {
                // 不旋转或者 旋转180
                name += r.height;
                rot = g.getRandom(choice_rot);
            }
            let node = await this.createCar('env/cars/1/' + name, r, rot)
            let car = node.getComponent(Car)
            car.color = gid;
            node['_tag'] = gid;
            this.cars.push(node);
        }
        this.onCarsLoaded.fire(this);
    }

    async createCar(path, r: Rect, rot) {
        let x = r.center.x - 0.5;
        let y = r.center.y - 0.5;
        let prefab = await ccUtil.getRes(path, Prefab);
        let node = instantiate(prefab) as Node
        node.eulerAngles = v3(0, rot, 0);

        let pos = this.tilemap.translateToCenter(x, y, es)
        node.setPosition(pos.x, 0, pos.y);

        node.parent = this.node
        return node;
    }
    /**
     * 判断叶子节点 ，或者直接在地图上标记叶子节点
     * 然后从叶子节点寻路
     * @param rs 
     */
    createPath(rs: Rect[]) {
        // MapLoader.path = 
        let path = '';
        let layer = this.tilemap.getLayer("layer")
        let leaf = null
        for (var i = 0; i < rs.length; i++) {
            let r = rs[i];
            let front = v2(r.xMin, r.yMin);
            let back = v2(r.xMin, r.yMax - 1);
            if (r.width > 1) {
                back = v2(r.xMax - 1, r.yMin);
            }
            let arr = [front, back]
            leaf = arr.find(v => this.isLeaf(layer, v))
            if (leaf) {
                break;
            }
        }
        if (leaf) {
            //leaf 
            let path = []
            this.findPath(layer, leaf, path)
            // path.forEach(v => console.log(v))
            this.convertPath(path);
            this.path = path;
            this.onPathLoaded.fire(this.path)
        }
    }

    convertPath(path: Vec2[]) {
        path.forEach((v, i) => {
            let point = this.tilemap.translateToCenter(v.x, v.y, es)
            path[i] = point
        })
    }

    contains(path: Vec2[], p: Vec2) {
        return path.find(v => v.x == p.x && v.y == p.y) != null
    }

    findPath(layer: TileLayerData, v: Vec2, path: Vec2[]) {
        path.push(v);
        //递归四向搜索
        dir4.find(t => {
            let p = v2(t.x + v.x, t.y + v.y)
            let gid = this.tilemap.getGid(layer, p.x, p.y)
            if (gid == Gid.Path && !this.contains(path, p)) {
                this.findPath(layer, p, path);
            }
        })
    }

    isLeaf(layer: TileLayerData, v: Vec2) {
        //判断四周,超过2个接触点则非叶子节点
        let n = 0;
        for (var i = 0; i < dir4.length; i++) {
            let t = dir4[i]
            let gid = this.tilemap.getGid(layer, t.x + v.x, t.y + v.y)
            if (gid == Gid.Path) {
                n++;
            }
            if (n >= 2) {
                return false;
            }
        }
        if (n <= 1) {
            return true;
        }
    }

    createWalls(rs: Rect[]) {
        for (var i = 0; i < rs.length; i++) {
            let r = rs[i];
            if (r.x == 0 || r.x == this.tilemap.data.width - 1) {
                // 左右边缘墙 
                this.createNodeArray("env/ConcreteBarrier", r)
            } else if (r.y == 0 || r.y == this.tilemap.data.height - 1) {
                this.createNodeArray("env/ConcreteBarrier", r)
            } else {
                this.createRandomBarrier(r);
            }
        }
    }

    async createRandomBarrier(rect: Rect) {
        for (var i = 0; i < rect.width; i++) {
            for (var j = 0; j < rect.height; j++) {
                let x = rect.x + i;
                let y = rect.y + j;
                let path = 'env/' + g.getRandom(Barriers);
                let prefab = await ccUtil.getRes(path, Prefab);
                let node = instantiate(prefab) as Node
                let es = 1.15;
                let pos = this.tilemap.translateToCenter(x, y, es)
                node.setPosition(pos.x, 0, pos.y);
                node.parent = this.node
            }
        }
    }

    async createNodeArray(path, rect: Rect, rot = 0) {
        let prefab = await ccUtil.getRes(path, Prefab);
        for (var i = 0; i < rect.width; i++) {
            for (var j = 0; j < rect.height; j++) {
                let rot = 0;
                let x = rect.x + i;
                let y = rect.y + j;
                let offsetY = 0;
                let offsetX = 0;
                if (x == 0) {
                    // 左右边缘墙 
                    rot = 90;
                    offsetY = -0.25;
                }

                if (x == this.tilemap.data.width - 1) {
                    // if (y == this.tilemap.data.height - 1) {
                    //     offsetX = 0.25
                    // } else if (y == 0) {
                    //     offsetX = -0.25;
                    // }
                    offsetX = -0.25;
                    rot = 90;
                    offsetY = -0.25;
                }
                if (rect.width > 1) {
                    rot = 0;
                    offsetY = -0.25;
                }
                let node = instantiate(prefab) as Node
                node.eulerAngles = v3(0, rot, 0);
                let pos = this.tilemap.translateToCenter(x, y, es)
                node.setPosition(pos.x + offsetX, 0, pos.y + offsetY);
                node.parent = this.node
            }
        }
    }

    start() {

    }
}