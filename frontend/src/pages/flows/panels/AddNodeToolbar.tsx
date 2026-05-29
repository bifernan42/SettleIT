import { Button } from '@/components/ui/button';
import type { CreateFlowNodeDtoType } from '@/api/generated/model';

const NODE_TYPES: CreateFlowNodeDtoType[] = ['TRIGGER', 'ACTION', 'CONDITION', 'DELAY', 'END'];

const TYPE_VARIANT: Record<string, 'default' | 'outline'> = {
  TRIGGER: 'default',
  ACTION: 'outline',
  CONDITION: 'outline',
  DELAY: 'outline',
  END: 'outline',
};

interface Props {
  onAdd: (type: CreateFlowNodeDtoType) => void;
}

export default function AddNodeToolbar({ onAdd }: Props) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg border shadow-sm p-2">
      {NODE_TYPES.map((type) => (
        <Button
          key={type}
          size="sm"
          variant={TYPE_VARIANT[type]}
          onClick={() => onAdd(type)}
        >
          + {type}
        </Button>
      ))}
    </div>
  );
}
