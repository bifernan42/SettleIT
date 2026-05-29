import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { DomainNode } from '../hooks/useFlowEditor';

interface Props {
  node: DomainNode | null;
  onClose: () => void;
  onSave: (nodeId: string, settings: Record<string, unknown>) => void;
}

export default function NodeSettingsPanel({ node, onClose, onSave }: Props) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (node) {
      setRaw(JSON.stringify(node.settings, null, 2));
      setError('');
    }
  }, [node]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(raw);
      onSave(node!.id, parsed);
      setError('');
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-96 flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>
            {node?.type} <span className="font-mono text-xs text-muted-foreground">{node?.id.slice(0, 8)}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 flex-1">
          <p className="text-sm text-muted-foreground">Settings (JSON)</p>
          <textarea
            className="flex-1 font-mono text-xs rounded-md border bg-muted p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={16}
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <Button onClick={handleSave}>Save settings</Button>
      </SheetContent>
    </Sheet>
  );
}
