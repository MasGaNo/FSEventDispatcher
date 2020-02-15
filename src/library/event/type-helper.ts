export interface FSEventMediator {
  [key: string]: (...args: Array<any>) => void;
}
