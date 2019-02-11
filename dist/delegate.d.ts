interface IEventCallback {
    callback: Function | any;
    context: any;
}
export declare class Delegate {
    private list;
    private internalList;
    constructor();
    add(callback: IEventCallback): void;
    remove(callbackParam: IEventCallback): void;
    execute(...args: any[]): any[];
}
export default Delegate;
