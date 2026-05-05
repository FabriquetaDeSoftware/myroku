import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { Command } from './command.types';

type State = { commands: Command[] };

export const CommandBusStore = signalStore(
  { providedIn: 'root' },
  withState<State>({ commands: [] }),
  withMethods((store) => ({
    register(cmds: Command[]): void {
      const existing = new Set(store.commands().map((c) => c.id));
      const added = cmds.filter((c) => !existing.has(c.id));
      patchState(store, { commands: [...store.commands(), ...added] });
    },
    unregister(ids: string[]): void {
      const set = new Set(ids);
      patchState(store, {
        commands: store.commands().filter((c) => !set.has(c.id)),
      });
    },
    search(query: string): Command[] {
      const q = query.trim().toLowerCase();
      const all = store
        .commands()
        .filter((c) => (c.visible ? c.visible() : true));
      if (!q) return all;
      return all.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q),
      );
    },
  })),
);

export type CommandBusStore = InstanceType<typeof CommandBusStore>;

/** Helper para agrupar resultados na UI. */
export function groupCommands(cmds: Command[]): Map<string, Command[]> {
  const map = new Map<string, Command[]>();
  for (const cmd of cmds) {
    const list = map.get(cmd.group) ?? [];
    list.push(cmd);
    map.set(cmd.group, list);
  }
  return map;
}

// Exporta computed helper só para tipagem; o import direto de `computed` evita lint warning.
void computed;
