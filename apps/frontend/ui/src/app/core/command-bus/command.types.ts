export type CommandGroup =
  | 'Navegar'
  | 'Aplicações'
  | 'Ações'
  | 'GitHub'
  | 'Sistema';

export interface Command {
  id: string;
  label: string;
  group: CommandGroup;
  icon?: string;
  shortcut?: string;
  run: () => void | Promise<void>;
  visible?: () => boolean;
}
