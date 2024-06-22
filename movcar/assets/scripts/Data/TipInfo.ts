import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipInfo')
export default class TipInfo {
    id: number = 0;
    txt:string = "";
    constructor(id) {
        let d = csv.Tip.get(id);
        if(d){
            this.id = d.id;
            this.txt = d.txt;
        }
       
    }
    
}
