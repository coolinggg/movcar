import DataCenter, { dc, field } from "../../framework3D/core/DataCenter";
import { UserInfo } from "../../framework3D/extension/weak_net_game/UserInfo";
import Platform from "../../framework3D/extension/Platform";


@dc("PlayerInfo")
export default class PlayerInfoD extends DataCenter {


    /////////////////////////////////////////////通用功能 
    // /**签到次数 */
    // @field()
    // CheckInCount: number = 0;
    // @field()
    // CheckInTime: number = Date.now();

    @field()
    level: number = 1;

    @field()
    level_turn: number = 1;

    @field()
    level_dodge: number = 1;

    //tmp 
    //加速buff
    buff_speedup = 0

    @field({ persistent: false })
    timeLeft: number = 0;


    @field()
    revived: number = 0;

    isWin: boolean = false;

    isEnd: boolean = true;

    @field()
    guide: number = 0;

    get isLose() {
        return !this.isWin
    }

    onLevelStart() {
        this.revived = 0;
        this.isWin = false;
        this.isEnd = false
    }

    onLevelEnd(v) {
        this.isEnd = true;
        this.isWin = v;
        if (v) {
            //结束 上传数据 
            // 上传数据 
            PlayerInfo.level++;
            PlayerInfo.save("level")
            Platform.uploadScore('level', { level: PlayerInfo.level })
            UserInfo.uploadUserInfo({ level: PlayerInfo.level })
        }
    }



}


export let PlayerInfo: PlayerInfoD = DataCenter.register(PlayerInfoD);