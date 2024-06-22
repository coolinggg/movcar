
const { ccclass, property } = cc._decorator;

export enum EventType {
    paySuccess,
    payFail,
    tools,
    revive,
    award,
}

export enum LevelEndEventType {
    Exit = 0,
    Win = 1,
    Lose = 2
}



@ccclass
export default class StatHepler {
    static level_end_event: LevelEndEventType = LevelEndEventType.Exit
    static current_lv_desc: string = ""
    static isInLevel = false;


    static _userId:string = '';
    static levelId:string = '0';

    static init(userId)
    {
        this._userId = userId
    }

    static startLevel(levelId, lv_desc) {
        this.levelId = levelId;
        this.current_lv_desc = lv_desc
        //默认为退出，其它 状态 会设置 成功或者 失败,不设置 就是退出
        StatHepler.level_end_event = LevelEndEventType.Exit;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.aldStage.onStart({
                stageId: levelId,
                stageName: this.current_lv_desc,
                userId: this._userId
            });
        }
        this.isInLevel = true;
    }

    static setLevelEndEvent(evt: LevelEndEventType) {
        StatHepler.level_end_event = evt;
    }

    static userAction(eventName, k?, v?) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (k) {
                let param = {}
                param[k] = v;
                wx.aldSendEvent(eventName, param)
            } else {
                let param = {}
                param["userId"] = this._userId;
                wx.aldSendEvent(eventName)
            }
        }
    }

    static doLevelEvent(eventType: EventType, itemName, itemId, itemCount = 1, itemMoney = "1") {
        if (!this.isInLevel) return;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.aldStage.onRunning({
                stageId: this.levelId,
                stageName: this.current_lv_desc,
                userId: this._userId,
                event: EventType[eventType],
                params: {
                    itemName, itemId, itemCount, itemMoney
                }
            })
        }
    }

    static endLevel() {
        //统计
        //------------------------------------------------------------------------------//
        let desc = ""
        let ald_event = ''
        switch (StatHepler.level_end_event) {
            case LevelEndEventType.Win:
                desc = "完成关卡"
                ald_event = 'complete'
                break;
            case LevelEndEventType.Lose:
                desc = "关卡失败"
                ald_event = "fail"
                break;
            case LevelEndEventType.Exit:
                desc = "中途退出"
                ald_event = "fail"
                return;
                // break;
        }
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.aldStage.onEnd({
                stageId: this.levelId,
                stageName: this.current_lv_desc,
                userId: this._userId,
                event: ald_event,
                params: {
                    desc
                }
            });
        }
        this.isInLevel = false;
        //------------------------------------------------------------------------------//
    }

}