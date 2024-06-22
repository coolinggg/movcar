import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelInfo')
export default class LevelInfo {
    id: number = 0;
    configure: string[] = [];

    constructor(id) {
        let d = csv.level.get(id);
        if (d) {
            this.id = d.id;
            this.configure = d.configure.split("/");
        }
    }
}
