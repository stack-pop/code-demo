import React, { createContext, useContext, useState } from 'react';

/**
 * 原理：
 * Updater 记录会触发 setter 的 keys
 * 调用 watcher 的 update 方法时，拿到 update 方法入参对象的所有 key，找到监听了 key 的所有 updater。
 * 
 * 其实每一个
 */

interface Updater {
  keys: string[];
  setter: React.Dispatch<React.SetStateAction<any>>;
}
export class Watcher {
  data: any;
  updaters: Updater[];
  constructor() {
    this.updaters = [];
    this.data = {};
  }

  update(p: Record<string, any>) {
    this.data = {
      ...this.data,
      ...p
    };
    const activedUpdaters: Updater[] = [];
    this.updaters.forEach(item => {
      const actvied = Object.keys(p).some(key => item.keys.includes(key));
      if (actvied) {
        activedUpdaters.push(item);
      }
    })
    activedUpdaters.forEach(item => {
      item.setter({
        ...this.data
      });
    });
  }

  push({ keys, setter }: { keys: string[]; setter: React.Dispatch<React.SetStateAction<any>> }) {
    this.updaters.push({
      keys,
      setter
    });
  }
}

const globalWatcher = new Watcher();

export const useGlobalWatch = (keys: string[]) => {
  const [state, setState] = useState();

  globalWatcher?.push({
    keys,
    setter: setState,
  });

  return {
    state,
    update: globalWatcher?.update,
  };
};

const ScopeContext = createContext<Watcher | null>(null);
export const ContextProvider = <ScopeContext.Provider value={new Watcher()} />;

export const useScopeWatch = (keys: string[]) => {
  const [state, setState] = useState();
  const watcher = useContext(ScopeContext);

  watcher?.push({
    keys,
    setter: setState,
  });

  return {
    state,
    update: watcher?.update,
  };
};
