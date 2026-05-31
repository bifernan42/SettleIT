import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { DomainNode } from '../hooks/useFlowEditor';

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';
const labelClass = 'block text-sm font-medium text-foreground mb-1';
const selectClass = inputClass + ' cursor-pointer';

// ─── Sous-formulaires par type ────────────────────────────────────────────────

function TriggerForm() {
  return (
    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
      <p className="font-semibold mb-1">🚀 Point d'entrée du workflow</p>
      <p className="text-green-700 text-xs">
        Ce nœud démarre automatiquement quand un examen patient est enregistré. Aucun paramètre à
        configurer.
      </p>
    </div>
  );
}

function EndForm() {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
      <p className="font-semibold mb-1">🏁 Fin du workflow</p>
      <p className="text-gray-500 text-xs">
        Ce nœud termine le workflow. Aucun paramètre à configurer.
      </p>
    </div>
  );
}

interface DelayFormProps {
  settings: Record<string, unknown>;
  onSave: (s: Record<string, unknown>) => void;
}
function DelayForm({ settings, onSave }: DelayFormProps) {
  const [delayDays, setDelayDays] = useState<number>(
    typeof settings.delayDays === 'number' ? settings.delayDays : 1,
  );

  useEffect(() => {
    setDelayDays(typeof settings.delayDays === 'number' ? settings.delayDays : 1);
  }, [settings]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>⏳ Délai (en jours)</label>
        <input
          type="number"
          min={1}
          max={365}
          className={inputClass}
          value={delayDays}
          onChange={(e) => setDelayDays(Math.max(1, parseInt(e.target.value) || 1))}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Le workflow attend ce nombre de jours avant de passer au nœud suivant.
        </p>
      </div>
      <Button onClick={() => onSave({ delayDays })}>Enregistrer</Button>
    </div>
  );
}

const ACTION_TYPES = [
  { value: 'EMAIL', label: '📧 Email' },
  { value: 'SMS', label: '💬 SMS' },
  { value: 'WHATSAPP', label: '🟢 WhatsApp' },
  { value: 'COURRIER', label: '📮 Courrier postal' },
] as const;

interface ActionFormProps {
  settings: Record<string, unknown>;
  onSave: (s: Record<string, unknown>) => void;
}
function ActionForm({ settings, onSave }: ActionFormProps) {
  const [actionType, setActionType] = useState<string>(
    typeof settings.actionType === 'string' ? settings.actionType : 'EMAIL',
  );
  const [messageContent, setMessageContent] = useState<string>(
    typeof settings.messageContent === 'string' ? settings.messageContent : '',
  );

  useEffect(() => {
    setActionType(typeof settings.actionType === 'string' ? settings.actionType : 'EMAIL');
    setMessageContent(
      typeof settings.messageContent === 'string' ? settings.messageContent : '',
    );
  }, [settings]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Canal d'envoi</label>
        <select
          className={selectClass}
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          {ACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Contenu du message (factice)</label>
        <textarea
          className={inputClass + ' resize-none'}
          rows={5}
          placeholder="Ex : Bonjour, votre reste à charge est de XX€. Merci de procéder au règlement..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ce message est indicatif — aucun envoi réel n'est effectué.
        </p>
      </div>
      <Button onClick={() => onSave({ actionType, messageContent })}>Enregistrer</Button>
    </div>
  );
}

const DATA_FIELDS = [
  { value: 'email', label: '📧 Email du patient' },
  { value: 'phone', label: '📱 Numéro de téléphone' },
  { value: 'whatsapp', label: '🟢 WhatsApp' },
] as const;

const ACTION_CHECKS = [
  { value: 'rejected', label: '❌ Email rejeté (bounce)' },
  { value: 'opened', label: '✅ Email ouvert' },
  { value: 'undelivered', label: '📵 SMS non délivré' },
] as const;

const CONDITION_CATEGORIES = [
  { value: 'DATA_AVAILABLE', label: 'Donnée disponible ?' },
  { value: 'ACTION_RESULT', label: "Résultat d'une action" },
] as const;

interface ConditionFormProps {
  settings: Record<string, unknown>;
  onSave: (s: Record<string, unknown>) => void;
}
function ConditionForm({ settings, onSave }: ConditionFormProps) {
  const [category, setCategory] = useState<string>(
    typeof settings.conditionCategory === 'string' ? settings.conditionCategory : 'DATA_AVAILABLE',
  );
  const [field, setField] = useState<string>(
    typeof settings.field === 'string' ? settings.field : 'email',
  );
  const [check, setCheck] = useState<string>(
    typeof settings.check === 'string' ? settings.check : 'rejected',
  );

  useEffect(() => {
    setCategory(
      typeof settings.conditionCategory === 'string'
        ? settings.conditionCategory
        : 'DATA_AVAILABLE',
    );
    setField(typeof settings.field === 'string' ? settings.field : 'email');
    setCheck(typeof settings.check === 'string' ? settings.check : 'rejected');
  }, [settings]);

  const handleSave = () => {
    const base = { conditionCategory: category };
    if (category === 'DATA_AVAILABLE') onSave({ ...base, field });
    else onSave({ ...base, check });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        Reliez la sortie <span className="font-semibold text-green-600">✓ Oui</span> et{' '}
        <span className="font-semibold text-red-500">✗ Non</span> aux nœuds suivants depuis les
        handles colorés en bas du nœud.
      </div>

      <div>
        <label className={labelClass}>Type de condition</label>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CONDITION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {category === 'DATA_AVAILABLE' ? (
        <div>
          <label className={labelClass}>Donnée vérifiée</label>
          <select
            className={selectClass}
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            {DATA_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Résultat vérifié</label>
          <select
            className={selectClass}
            value={check}
            onChange={(e) => setCheck(e.target.value)}
          >
            {ACTION_CHECKS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button onClick={handleSave}>Enregistrer</Button>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

const TYPE_TITLES: Record<string, string> = {
  TRIGGER: '🚀 Départ',
  ACTION: '📤 Action',
  CONDITION: '❓ Condition',
  DELAY: '⏳ Délai',
  END: '🏁 Fin',
};

interface Props {
  node: DomainNode | null;
  onClose: () => void;
  onSave: (nodeId: string, settings: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

export default function NodeSettingsPanel({ node, onClose, onSave, onDelete }: Props) {
  if (!node) return null;

  const renderForm = () => {
    switch (node.type) {
      case 'TRIGGER':
        return <TriggerForm />;
      case 'END':
        return <EndForm />;
      case 'DELAY':
        return <DelayForm settings={node.settings} onSave={(s) => onSave(node.id, s)} />;
      case 'ACTION':
        return <ActionForm settings={node.settings} onSave={(s) => onSave(node.id, s)} />;
      case 'CONDITION':
        return <ConditionForm settings={node.settings} onSave={(s) => onSave(node.id, s)} />;
      default:
        return <p className="text-sm text-muted-foreground">Type de nœud inconnu.</p>;
    }
  };

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-96 flex flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{TYPE_TITLES[node.type] ?? node.type}</SheetTitle>
        </SheetHeader>

        <div className="flex-1">{renderForm()}</div>

        <div className="border-t pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              onDelete(node.id);
              onClose();
            }}
          >
            Supprimer ce nœud
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
