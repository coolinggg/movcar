import TilemapLoader, { TilemapData, TileLayerData } from "./TilemapLoader";
import { Prefab, Component, _decorator, Enum, Vec2, v2, size, Rect, v3 } from "cc";
import Signal from "../../../framework3D/core/Signal";
let { property, ccclass } = _decorator



@ccclass
export default class Tilemap extends Component {
    data: TilemapData;

    fromBottom: boolean = true;

    @property
    segCount: number = 1;

    @property
    segIndex: number = 0;

    @property
    private _path: string = ""

    @property
    get path() {
        return this._path;
    }


    onLoaded: Signal = new Signal();

    get segHeight() {
        return this.data.height / this.segCount;
    }

    // 分段
    onLoad() {

    }

    set path(val) {
        this._path = val;
        TilemapLoader.loadTilemap(val).then(v => {
            this.data = v;
            this.onLoaded.fire(this);
            // this.render()
        })
    }

    start() {

    }

    getMapSize() {
        return size(this.data.width, this.data.height);
    }

    getTileSize() {
        return size(this.data.tilewidth, this.data.tileheight);
    }

    render() {
        for (var i = 0; i < this.data.layers.length; i++) {
            var alyer = this.data.layers[i]
            if (alyer.type == "tilelayer") {
                this.renderLayer(alyer, i)
            } else if (alyer.type == 'objectgroup') {
                this.renderObjectLayer(alyer, i);
            }
        }
    }

    getLayer(layerName: string) {
        return this.data.layers.find(v => v.name == layerName)
    }

    /** x, y coord 坐标，左下为0,0  */
    getGid(layer: TileLayerData, x, y) {
        return layer.data[(this.data.height - y - 1) * layer.width + x]
    }

    getPositionAt(x, y) {
        return v2(this.data.tilewidth * x, this.data.tileheight * (this.data.height - y - 1));
    }

    /**以0，0 为中心点，转换坐标 */
    translateToCenter(x, y, scale = 1) {
        let size = this.getMapSize();
        let hh = size.height / 2;
        let hw = size.width / 2;
        return v2((x - hw + 0.5) * scale, (-y + hh - 0.5) * scale);
    }


    renderObjectLayer(layer: TileLayerData, i) {
        console.warn("not implement !");
    }

    // 0 ,0 ,0, 0
    // 0 ,0 ,0, 0
    // 0 ,0 ,0, 0
    // 0 ,1 ,0, 0

    renderLayer(layer: TileLayerData, layerIndex) {
        //左上开始 =》 左下开始
        for (var i = 0; i < layer.width; i++) {
            let segHeight = this.segHeight
            for (var j = 0; j < segHeight; j++) {
                let y = j;
                if (this.fromBottom) {
                    y = layer.height - this.segIndex * this.segCount - 1 - j;
                }
                let ind = (y) * layer.width + i;
                let gid = layer.data[ind]
                if (gid > 0) {
                    this.renderGid(gid, i, j, layerIndex)
                }
            }
        }
    }


    onRenderGrid: Signal = new Signal();

    renderGid(gid, x, y, layerIndex) {
        this.onRenderGrid.fire(gid, x, y, layerIndex, this);
    }

    findRectangles(layerName) {
        let layer = this.getLayer(layerName)
        var IDX = (x, y) => y * layer.width + x;
        var G = (x, y) => layer.data[IDX(x, y)];
        let mw = this.data.width;
        let mh = this.data.height;
        //向右合并
        var moveR = (gid, x, y) => {
            let ret = []
            for (var i = x; i < mw; i++) {
                let g = G(i, y)
                if (gid == g) {
                    ret.push(v2(i, y))
                } else {
                    break;
                }
            }
            return ret;
        }

        var moveD = (gid, rs: Vec2[]) => {
            let tl = rs[0]
            let rows = [] // e: rs 
            rows.push(rs)
            for (var i = tl.y + 1; i < mh; i++) {
                let row = [];
                let canMove = rs.every(v => {
                    let xy = cc.v2(v.x, i)
                    let g = G(xy.x, xy.y);
                    //向下合并
                    if (g == gid) {
                        row.push(xy)
                        return true;
                        // } else if (i == mh - 1) {
                        //     //最下面一行是空也可以合并
                        //     row.push(xy)
                        //     return true;
                    }
                })
                if (!canMove) {
                    break;
                }
                rows.push(row);
            }
            return rows;
        }
        let tags = {}
        let rects_map: { [index: number]: Rect[] } = {}
        let tilesize = this.getTileSize();
        // let sizeInPx = size(tilesize.width * mw, tilesize.height * mh)
        let tagRect = (rows: Vec2[][]) => {
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i]
                for (var j = 0; j < row.length; j++) {
                    let c = row[j]
                    let idx = IDX(c.x, c.y)
                    //将该cell标记为已处理
                    tags[idx] = true;
                }
            }
            let lt = rows[0][0]
            let rb = rows[rows.length - 1].pop();
            // let origin = this.getPositionAt(lt.x, rb.y);
            // return cc.rect(origin.x, origin.y, (rb.x - lt.x + 1) * tilesize.width, (rb.y - lt.y + 1) * tilesize.height)
            return cc.rect(lt.x, mh - rb.y - 1, rb.x - lt.x + 1, rb.y - lt.y + 1)
        }
        for (var x = 0; x < mw; x++) {
            for (var y = 0; y < mh; y++) {
                let c = v2(x, y)
                let gid = G(c.x, c.y);
                let idx = IDX(c.x, c.y)
                if (gid != 0 && tags[idx] == null) {
                    //move right 
                    let rows = moveD(gid, moveR(gid, x, y))
                    let rect = tagRect(rows);
                    let rects = rects_map[gid]
                    if (rects == null) {
                        rects = []
                        rects_map[gid] = rects
                    }
                    rects.push(rect);
                }
            }
        }
        // let sum = Object.keys(rects_map).reduce((sum, v) => {
        //     return sum + v.length;
        // }, 0)
        // for (var gid in rects_map) {
        //     var rects = rects_map[gid]
        //     console.log(`${gid || "unknown type:" + gid}: ${rects.length} count`)
        // }
        return rects_map;

    }

}