declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.png' {
  const value: any
  export = value;
}
declare module '*.svg' {
  const value: any
  export = value;
}

declare module 'vue-infinite-scroll' {
  const value: any
  export = value;
}

declare module '@nuclearpowered/dropship-native-addon' {
  export function parse(userpath: string): any;
}
