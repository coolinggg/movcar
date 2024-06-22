
import DataCenter, { dc, field } from "../../../framework3D/core/DataCenter";
import gameUtil from "../../utils/gameUtil";

@dc("Sov")
export default class SovInfoDC extends DataCenter {

    @field()
    sovInvokeCounts: { [index: string]: number } = {}

    onLoadAll() {
        if (gameUtil.isNextDay(this.save_timestamps)) {
            for (var k in this.sovInvokeCounts) {
                this.sovInvokeCounts[k] = 0;
            }
        }
    }

    getCount(keySov: string) {
        let c = this.sovInvokeCounts[keySov]
        if (c == null) {
            c = 0
            this.sovInvokeCounts[keySov] = c;
        }
        return c;
    }

    invoke(keySov: string) {
        let c = this.getCount(keySov);
        this.sovInvokeCounts[keySov] = ++c;
        this.save();
    }
}
export let SovInfo: SovInfoDC = DataCenter.register(SovInfoDC);
