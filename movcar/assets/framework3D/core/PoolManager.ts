import Signal from "./Signal";
import { SystemEventType, NodePool, Node, Scene, Pool } from "cc";

export default class PoolManager {
    nodePool: any = {}

    nodes = {}

    onCreateObject: Function;
    target: any;
    root: any;

    managed: boolean = false;
    aliveObjects: Node[] = []

    onRecycleSignal = new Signal();

    private static _instances: { [index: string]: PoolManager } = {}

    private static _idInc: number = 0;
    private _id: string = '0';

    _autoRecycle = false;

    log = false;

    constructor(root?: Node | Scene, onCreateObject?, target?) {
        this.onCreateObject = onCreateObject;
        this.target = target;
        this.root = root;
        this._id = PoolManager._idInc++ + "";
        PoolManager._instances[this._id] = this;
        // this.autoRecycle = this._autoRecycle;
    }

    set autoRecycle(v) {
        if (v) {
            this.root && this.root.on(SystemEventType.CHILD_REMOVED, this.onNodeRemove, this)
        } else {
            this.root && this.root.off(SystemEventType.CHILD_REMOVED, this.onNodeRemove, this)
        }
        this._autoRecycle = v
    }

    set name(v) {
        delete PoolManager._instances[this._id]
        this._id = v;
        PoolManager._instances[this._id] = this;
    }

    public static get(name) {
        return PoolManager._instances[name]
    }

    destroy() {
        this.clear();
        delete PoolManager._instances[this._id];
    }

    onNodeRemove(node: Node) {
        this.put(node);
        this.onRecycleSignal.fire(node);
    }

    objects() {
        return this.aliveObjects;
    }

    clearAlives() {
        for (var i = 0; i < this.aliveObjects.length;) {
            let obj = this.aliveObjects[i]
            obj.destroy()
            obj.destroyAllChildren();
            delete this.aliveObjects[i];
        }
    }

    getPool(type): NodePool {
        if (typeof (type) == "object") {
            type = type._uuid || type.name;
        }
        let pool = this.nodePool[type];
        if (pool == null) {
            pool = new NodePool();
            this.nodePool[type] = pool;
        }
        return pool;
    }

    get(type): Node {
        let node = this.getPool(type).get();
        if (this.onCreateObject) {
            if (node == null) {
                node = this.onCreateObject.call(this.target, type)
                if (this.root)
                    node.setParent(this.root);
                if (!node)
                    console.warn(node, "onCreateObject must return an object")
                if (this.managed)
                    this.aliveObjects.push(node);
                this.nodes[node.uuid] = type;
                return node;
            } else {
                if (this.log) {
                    console.warn("[PoolManager]retrive from pool:", node.name)
                }
            }
        }
        if (this.root) {
            node.active = true;
            node.setParent(this.root);
        }
        if (this.managed)
            this.aliveObjects.push(node);
        return node;
    }

    tag(node, type) {
        this.nodes[node.uuid] = type;
    }

    put(node: Node, type = null) {
        if (type == null)
            type = this.nodes[node.uuid];
        this.getPool(type).put(node);
        if (this.managed)
            this.aliveObjects.splice(this.aliveObjects.indexOf(node), 1);
    }

    clear(type?) {
        if (this.managed) {
            this.clearAlives();
        }
        if (type)
            this.getPool(type).clear();
        else {
            // this.root.off(SystemEventType.CHILD_REMOVED, this.onNodeRemove, this)
            for (var t in this.nodePool) {
                let pool = this.nodePool[t] as NodePool
                pool.clear();
                delete this.nodePool[t]
            }
            for (var k in this.nodes) {
                delete this.nodes[k];
            }
        }

    }

    size(type) {
        return this.getPool(type).size();
    }
}

window['PoolManager'] = PoolManager;