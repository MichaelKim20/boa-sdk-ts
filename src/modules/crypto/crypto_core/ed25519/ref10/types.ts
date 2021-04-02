
export class FE25519
{
    public static WIDTH = 10;

    public items: Int32Array;

    constructor (values?: Array<number> | Int32Array | FE25519)
    {
        this.items = new Int32Array(FE25519.WIDTH);
        if (values !== undefined)
        {
            if (values instanceof Int32Array)
                values.forEach((m, i) => this.items[i] = m);
            else if (values instanceof FE25519)
                values.items.forEach((m, i) => this.items[i] = m);
            else
                values.forEach((m, i) => this.items[i] = m);
        }
    }
}

export class GE25519_P2
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
}

export class GE25519_P3
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T: FE25519 = new FE25519();
}

export class GE25519_P1P1
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T: FE25519 = new FE25519();
}

export class GE25519_PreComp
{
    public yplusx: FE25519;
    public yminusx: FE25519;
    public xy2d: FE25519;

    constructor (p?: FE25519, m?: FE25519, d?: FE25519)
    {
        if (p !== undefined)
            this.yplusx = p;
        else
            this.yplusx = new FE25519();

        if (m !== undefined)
            this.yminusx = m;
        else
            this.yminusx = new FE25519();

        if (d !== undefined)
            this.xy2d = d;
        else
            this.xy2d = new FE25519();
    }
}

export class GE25519_Cached
{
    public YplusX: FE25519 = new FE25519();
    public YminusX: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T2d: FE25519 = new FE25519();
}