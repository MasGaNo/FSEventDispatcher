
interface IEventCallback {
    callback: Function|any;
    context: any;
}

export class Delegate {

    private list: IEventCallback[];
    private internalList: Function[] = [];

    public constructor() {
        this.list = [];
    }

    public add(callback: IEventCallback): void {
        this.list.push(callback);
    }

    public remove(callbackParam: IEventCallback): void {

        const callback = callbackParam.callback;
        const context = callbackParam.context;

        if (!callback && !context) {
            this.list.splice(0, this.list.length);
            for (let i = 0; i < this.internalList.length; ++i) {
                this.internalList[i](-1);
            }
            return;
        }
        for (let j = this.list.length - 1; j >= 0; --j) {
            const eventCallback = this.list[j];
            if ((!context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback)) ||
                (!callback && eventCallback.context === context) ||
                (eventCallback.context === context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback))
                ) {
                this.list.splice(j, 1);
                for (let i = 0; i < this.internalList.length; ++i) {
                    this.internalList[i](j);
                }
            }
        }
	
		/*var indexOf = -1;
		while ((indexOf = this.list.indexOf(callback) !== -1) {
			this.list.splice(indexOf, 1);
			for (var i = 0; i < Delegate.internalList.length; ++i) {
				Delegate.internalList[i](indexOf);
			}
		}*/
    }

    public execute(...args: any[]): any[] {

        let currentIndex = 0;

        const callbackRemove = function (position:number) {
            if (position === -1) {
                currentIndex = 0;
                return;
            }
            if (currentIndex && currentIndex >= position) {
                --currentIndex;
            }
        }

        this.internalList.push(callbackRemove);

		const returnValue: any[] = [];
		
        for (; currentIndex < this.list.length; ++currentIndex) {
            const event: IEventCallback = this.list[currentIndex];
            const returnVal = event.callback.apply(event.context, args);
			if (returnVal !== undefined) {
				returnValue.push(returnVal);				
			}
        }

        this.internalList.splice(this.internalList.indexOf(callbackRemove), 1);
		
		return returnValue;

    }

}

export default Delegate;