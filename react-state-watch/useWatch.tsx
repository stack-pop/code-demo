import React, { createContext, useContext, useState } from 'react';

export class Watcher {
  updaterMap: {
    [key: string]: React.Dispatch<React.SetStateAction<any>>[];
  };
  constructor() {
    this.updaterMap = {};
  }
  update(p: Record<string, any>) {
    Object.keys(p).forEach(key => {
      this.updaterMap[key].forEach(setter => {
        setter(p);
      });
    });
  }
  push({ keys, setter }: { keys: string[]; setter: React.Dispatch<React.SetStateAction<any>> }) {
    keys.forEach(key => {
      this.updaterMap[key].push(setter);
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
