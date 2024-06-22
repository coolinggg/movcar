import ccUtil from "../../../framework3D/utils/ccUtil";
import { PlayerInfo } from "../../Base/PlayerInfo";

export default class DodgeLevel {
    level: number = 0;
    interval_spawn: number = 1;
    interval_spawn2: number = 0;
    duration: number = 5
    life: number = 3;
    speed: number = 10;

    public constructor(id) {
        let data = csv.dodge.get(id)
        for (var k in data) {
            this[k] = data[k]
        }
    }

    static get current() {
        let level = PlayerInfo.level_dodge;
        return ccUtil.get(DodgeLevel, level);
    }

}