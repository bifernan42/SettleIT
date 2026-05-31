import { Button } from '@/components/ui/button';
import type { CreateFlowNodeDtoType } from '@/api/generated/model';

const NODE_TYPES: {
  type: CreateFlowNodeDtoType;
  label: string;
  title: string;
  variant: 'default' | 'outline';
}[] = [
  {
    type: 'TRIGGER',
    label: '🚀 Départ',
    title: "Point d'entrée — déclenché à l'enregistrement d'un examen",
    variant: 'default',
  },
  {
    type: 'ACTION',
    label: '📤 Action',
    title: "Envoi d'un message : Email, SMS, WhatsApp ou Courrier",
    variant: 'outline',
  },
  {
    type: 'CONDITION',
    label: '❓ Condition',
    title: 'Branchement conditionnel (Oui / Non)',
    variant: 'outline',
  },
  {
    type: 'DELAY',
    label: '⏳ Délai',
    title: "Pause entre deux étapes — ex. attendre 7 jours",
    variant: 'outline',
  },
  {
    type: 'END',
    label: '🏁 Fin',
    title: 'Fin du workflow',
    variant: 'outline',
  },
];

interface Props {
  onAdd: (type: CreateFlowNodeDtoType) => void;
}

export default function AddNodeToolbar({ onAdd }: Props) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/95 backdrop-blur-sm rounded-xl border shadow-md p-2">
      <span className="self-center text-xs text-muted-foreground font-medium pr-1 whitespace-nowrap">
        Ajouter :
      </span>
      {NODE_TYPES.map(({ type, label, title, variant }) => (
        <Button key={type} size="sm" variant={variant} title={title} onClick={() => onAdd(type)}>
          {label}
        </Button>
      ))}
    </div>
  );
}
