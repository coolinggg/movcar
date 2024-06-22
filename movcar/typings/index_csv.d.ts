
declare namespace csv{
    interface Item {
        type:number;
        id:number;
        count:number;
    }
    
    export class Config{
        
        /**
         * @type {string}
         * @description 显示 Banner 的View列表 - UIHelp,UILevelup,UICheckIn,UIRevive,UISetting,UIEnd 
         */
        static BannerAdWhiteList?:string;

        /**
         * @type {number}
         * @description 每个玩家每天能看多少个视频 - 100 
         */
        static max_video_watch?:number;

        /**
         * @type {number}
         * @description 多久上传一次数据 - 60 
         */
        static Sync_User_Data_Time?:number;

        /**
         * @type {number}
         * @description 跳过关卡 - 1 
         */
        static SOV_Skip_Game?:number;

        /**
         * @type {number}
         * @description 复活继续游戏 - 1 
         */
        static SOV_Receive?:number;

        /**
         * @type {number}
         * @description 复活banner位移延时（s） - 2 
         */
        static Revive_Banner_Delay?:number;

        /**
         * @type {number}
         * @description 结算banner位移延时（s） - 2 
         */
        static End_Banner_Delay?:number
    }

    interface dodge_Row {
        
        /**
         * @type {number}
         * @description 关卡 -  
         */
        level?:number,

        /**
         * @type {number}
         * @description 生成障碍间隔 -  
         */
        interval_spawn?:number,

        /**
         * @type {number}
         * @description 生成障碍跟据玩家位置 -  
         */
        interval_spawn2?:number,

        /**
         * @type {number}
         * @description 游戏时间 -  
         */
        duration?:number,

        /**
         * @type {number}
         * @description 生命值  -  
         */
        life?:number,

        /**
         * @type {number}
         * @description 车速 -  
         */
        speed?:number
    }
    
    export class dodge{
        static get(id:number|string):dodge_Row
        static values:dodge_Row[];
        static search(predicate: (value: dodge_Row, index: number) => boolean):dodge_Row[]
        static size:number;
    }


    interface level_Row {
        
        /**
         * @type {number}
         * @description id -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 配置 -  
         */
        configure?:string
    }
    
    export class level{
        static get(id:number|string):level_Row
        static values:level_Row[];
        static search(predicate: (value: level_Row, index: number) => boolean):level_Row[]
        static size:number;
    }


    interface Tip_Row {
        
        /**
         * @type {number}
         * @description 编号 -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 提示内容 -  
         */
        txt?:string
    }
    
    export class Tip{
        static get(id:number|string):Tip_Row
        static values:Tip_Row[];
        static search(predicate: (value: Tip_Row, index: number) => boolean):Tip_Row[]
        static size:number;
    }


}