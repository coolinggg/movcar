import { Component, _decorator, Vec3, v3, Node, v2, Vec2, Quat, quat, director, Director } from "cc";
let { ccclass, property, executionOrder } = _decorator;

@ccclass("MoveEngine")
@executionOrder(10)
export default class MoveEngine extends Component {
    @property
    acceleration: number = 2;

    velocity: Vec3 = v3();

    _maxVel: Vec3 = v3();
    _minVel: Vec3 = v3();

    force: Vec3 = v3();
    tmp_vec: Vec3 = v3();
    tmp_pos: Vec3 = v3();
    private _target: Vec3 = v3();


    public get target(): Vec3 {
        return this._target;
    }
    public set target(value: Vec3) {
        Vec3.copy(this._target, value);
    }


    @property
    damping: number = 0.98;

    @property
    _maxSpeed: number = 10;
    @property
    get maxSpeed() {
        return this._maxSpeed;
    }

    set maxSpeed(v) {
        this._maxSpeed = v
        this.updateMaxVelocity(v);

    }

    updateMaxVelocity(v) {
        this._maxVel = v3(v, v, v);
        this._minVel = v3(-v, -v, -v);
    }



    onLoad() {
        this.updateMaxVelocity(this.maxSpeed);
    }

    tmpQuat: Quat = quat();

    updateRotationY() {
        let quat = this.rotationY;
        this.node.rotation = quat
    }

    get rotationY() {
        let v = this.velocity;
        if (v.x == 0 && v.z == 0) return new Quat();
        let angle = v2(v.x, v.z).signAngle(Vec2.UNIT_Y)
        let quat = Quat.fromAxisAngle(this.tmpQuat, Vec3.UNIT_Y, angle)
        return quat;
    }

    get velocityNormalized() {
        let v = this.velocity;
        Vec3.normalize(this._vel_normalized, v)
        return this._vel_normalized;
    }

    private _vel_normalized: Vec3 = v3();
    private _lookQuat: Quat = quat();

    updateRotation() {
        let v = this.velocity;
        // Vec3.multiplyScalar(this._lookat_target, v, 2).add(this.node.position);
        Vec3.normalize(this._vel_normalized, v)
        Quat.fromViewUp(this._lookQuat, this._vel_normalized)
        this.node.rotation = this._lookQuat;
        // this.node.lookAt(this._lookat_target);
    }

    follow_vec: Vec3 = v3()


    seek_vec: Vec3 = v3()

    stop() {
        Vec3.zero(this.force);
        Vec3.zero(this.velocity);
    }

    _pause: boolean = false;

    pause() {
        this._pause = true;
    }

    resume() {
        this._pause = false
    }

    follow() {
        Vec3.subtract(this.follow_vec, this.target, this.node.position);
        this.follow_vec.normalize();
        this.follow_vec.multiplyScalar(this.acceleration);
        // this.follow_vec.multiplyScalar(1).subtract(this.velocity);
        // this.addForce(this.follow_vec);
        return this.follow_vec;
    }

    seek() {
        if (this._isWorldSpace) {
            Vec3.subtract(this.seek_vec, this.target, this.node.worldPosition);
        } else {
            Vec3.subtract(this.seek_vec, this.target, this.node.position);
        }
        this.seek_vec.normalize();
        this.seek_vec.multiplyScalar(this.maxSpeed).subtract(this.velocity);
        return this.seek_vec;
    }

    static _pauseAll: boolean = false;

    public static pauseAll() {
        this._pauseAll = true;
    }

    private static _timeScale: number = 1;
    public static set timeScale(v) {
        this._timeScale = v;
    }

    public static resumeAll() {
        this._pauseAll = false;
    }

    _isWorldSpace: boolean = false;

    setWorldSpace(b = true) {
        this._isWorldSpace = b;
    }

    _speed: number = 0;
    _isFullClamp: boolean = false;
    /**使用精准限速 */
    setClampSpeed(b = true) {
        this._isFullClamp = b;
    }

    get speed() {
        if (this._isFullClamp) {
            return this._speed;
        } else {
            this.velocity.length();
        }
    }

    _tmp_dir: Vec3 = v3();

    get dir() {
        this._tmp_dir.set(this.velocity);
        let s = this.speed;
        this._tmp_dir.set(this._tmp_dir.x / s, this._tmp_dir.y / s, this._tmp_dir.z / s)
        return this._tmp_dir;
    }


    update(dt) {
        if (this._pause) return;
        if (MoveEngine._pauseAll) return;
        // let dt2 = director.getDeltaTime();
        // console.log(dt, dt2);
        // this.force.multiplyScalar(dt * MoveEngine._timeScale);
        this.velocity.add(this.force);
        if (this._isFullClamp) {
            let len = this.velocity.length();
            let len2 = Math.min(len, this.maxSpeed);
            this._speed = len2;
            this.velocity.set(this.velocity.x / len * len2, this.velocity.y / len * len2, this.velocity.z / len * len2)
        } else {
            this.velocity.clampf(this._minVel, this._maxVel)
        }
        // let dtscale: number = dt / (1 / 60.0);
        Vec3.multiplyScalar(this.tmp_vec, this.velocity, dt * MoveEngine._timeScale);
        if (this._isWorldSpace) {
            var pos = this.node.worldPosition;
            pos.add(this.tmp_vec);
            this.node.setWorldPosition(pos)
        } else {
            var pos = this.node.position;
            pos.add(this.tmp_vec);
            this.node.setPosition(pos)
        }

        this.force.set(0, 0, 0);
        this.velocity.multiplyScalar(this.damping);
    }

    addForce(f: Vec3) {
        this.force.add(f);
    }


    getNormalPoint(point: Vec2, a: Vec2, b: Vec2): Vec2 {
        let ab = b.clone().subtract(a);
        let ap = point.clone().subtract(a);
        // ab.normalizeSelf()
        // let ap_ab = ab.mul(ap.dot(ab))
        let ap_ab = ap.project(ab)
        // return a.add(ap_ab);
        return ap_ab.add(a);
    }

    @property()
    isPathLoop: boolean = true;
    @property()
    isPathPingPong: boolean = false;

    _currentPathIndex: number = 0;

    followPath(path: Vec2[], pathPredict: number = 1, fuzzyReachDistsq = 1) {
        if (this._currentPathIndex == path.length - 1) {
            return v3();
        }
        // this.drawPath(Game.instance.graphics);
        let predict = v2(this.velocity.x, this.velocity.z);
        predict.normalize();
        predict.multiplyScalar(pathPredict);
        let pos = this.node.position;
        let pos2D = cc.v2(pos.x, pos.z);
        predict.add(pos2D);//predictLocation
        let target: Vec2;
        let a = path[this._currentPathIndex].clone();
        let b = path[this._currentPathIndex + 1].clone();
        let normalpoint = this.getNormalPoint(predict, a, b);
        let distsq = Vec2.squaredDistance(normalpoint, b);
        if (distsq <= fuzzyReachDistsq) {
            this._currentPathIndex += 1;
            if (this.isPathLoop && this._currentPathIndex >= path.length - 1) {
                this._currentPathIndex = 0;
                if (this.isPathPingPong) {
                    path.reverse();
                    return this.seek();
                }
            }
        }
        target = (normalpoint).add(b.subtract(a).normalize().multiplyScalar(pathPredict))
        if (distsq > fuzzyReachDistsq) {
            this.target = v3(target.x, 0, target.y);
            return this.seek();
        }
        return v3();
    }

    get currentPathIndex() {
        return this._currentPathIndex;
    }

    set currentPathIndex(v) {
        this._currentPathIndex = v;
    }
}
