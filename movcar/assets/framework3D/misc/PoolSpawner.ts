import { Component, _decorator, Node, instantiate, Prefab, Pool } from "cc";
import PoolManager from "../core/PoolManager";
import ccUtil from "../utils/ccUtil";
let { ccclass, property, menu } = _decorator
@ccclass("Spawner")
export class Spawner {
    @property
    spawnerName: string = "";

    @property({ type: Node, visible() { return !this.usePrefab } })
    template: Node = null;

    @property({ type: Prefab, visible() { return this.usePrefab } })
    prefab: Prefab = null;

    @property()
    usePrefab: boolean = true;
}

@ccclass
@menu("mimgame/PoolSpawner")
export default class PoolSpawner extends Component {
    poolManager: PoolManager = null;
    @property(Node)
    target: Node = null;

    @property
    poolName: string = ""

    @property([Spawner])
    spawners: Spawner[] = []

    dynamicPrefabs: { [index: string]: string } = {};

    private dynamicPrefabs_loaded: { [index: string]: boolean } = {};
    private _spawners: { [index: string]: Spawner } = {}

    static _instances: { [index: string]: PoolSpawner } = {}


    addSpawner(key, prefab: Prefab) {
        let spawner = this._spawners[key];
        if (spawner == null) {
            spawner = new Spawner();
            spawner.usePrefab = true;
            spawner.prefab = prefab;
            this._spawners[key] = spawner;
        }
    }

    hasSpawner(key) {
        return this._spawners[key] != null;
    }

    static get(name) {
        return PoolSpawner._instances[name];
    }

    onLoad() {
        this.poolManager = new PoolManager(this.target || this.node, this.onCreateObject, this)
        this.poolManager.name = this.poolName;
        this.spawners.forEach(v => {
            this._spawners[v.spawnerName] = v;
        })
        PoolSpawner._instances[this.poolName] = this;
    }

    //mark first,later load 
    preload(key: string | number, path: string) {
        this.dynamicPrefabs[key] = path;
        this.dynamicPrefabs_loaded[key] = false;
    }

    //preload prefab 
    preloadPrefabs() {
        let arr = []
        for (let k in this.dynamicPrefabs) {
            let v = this.dynamicPrefabs[k];
            let loaded = this.dynamicPrefabs_loaded[k]
            if (!loaded) {
                let promise = ccUtil.getRes(v, Prefab).then(v => {
                    let spawner = new Spawner();
                    spawner.usePrefab = true;
                    spawner.prefab = v;
                    this._spawners[k] = spawner;
                    this.dynamicPrefabs_loaded[k] = true
                })
                arr.push(promise)
            }
        }
        return Promise.all(arr);
    }

    onDestroy() {
        this.poolManager.destroy();
        PoolSpawner._instances[this.poolName] = null;
    }

    onCreateObject(type) {
        let cfg = this._spawners[type];
        if (cfg == null) {
            return console.error("Cannot get node from [" + this.poolName + "] pool by " + type)
        }
        return instantiate(cfg.usePrefab && cfg.prefab || cfg.template);
    }

    start() {
        this.preloadPrefabs();
    }
}