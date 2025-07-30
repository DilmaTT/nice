import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PokerMatrix } from "@/components/PokerMatrix";
import { ActionButton as ActionButtonType, Range } from "@/contexts/RangeContext";

const getActionColor = (actionId: string, allButtons: ActionButtonType[]): string => {
  if (actionId === 'fold') return '#6b7280';
  const button = allButtons.find(b => b.id === actionId);
  if (button && button.type === 'simple') {
    return button.color;
  }
  return '#ffffff';
};

const getActionButtonStyle = (button: ActionButtonType, allButtons: ActionButtonType[]) => {
  if (button.type === 'simple') {
    return { backgroundColor: button.color };
  }
  if (button.type === 'weighted') {
    const color1 = getActionColor(button.action1Id, allButtons);
    const color2 = getActionColor(button.action2Id, allButtons);
    return {
      background: `linear-gradient(to right, ${color1} ${button.weight}%, ${color2} ${button.weight}%)`,
    };
  }
  return {};
};

interface LegendPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  linkedRangeForPreview: Range | null | undefined;
  actionsInPreviewedRange: ActionButtonType[];
  actionButtons: ActionButtonType[];
  tempLegendOverrides: Record<string, string>;
  setTempLegendOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const LegendPreviewDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  linkedRangeForPreview,
  actionsInPreviewedRange,
  actionButtons,
  tempLegendOverrides,
  setTempLegendOverrides,
}: LegendPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Предпросмотр и редактирование легенды</DialogTitle>
        </DialogHeader>
        {linkedRangeForPreview && (
          <div>
            <PokerMatrix
              selectedHands={linkedRangeForPreview.hands}
              onHandSelect={() => {}}
              activeAction=""
              actionButtons={actionButtons}
              readOnly={true}
              isBackgroundMode={false}
              sizeVariant="editorPreview"
            />
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold">Редактировать названия:</h4>
              {actionsInPreviewedRange.map(action => (
                <div key={action.id} className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-4 h-4 rounded-sm border flex-shrink-0" style={getActionButtonStyle(action, actionButtons)} />
                    <Label htmlFor={`legend-override-${action.id}`}>{action.name}:</Label>
                  </div>
                  <Input
                    id={`legend-override-${action.id}`}
                    value={tempLegendOverrides[action.id] || ''}
                    onChange={(e) => setTempLegendOverrides(prev => ({ ...prev, [action.id]: e.target.value }))}
                    placeholder={`По умолчанию: ${action.name}`}
                    className="h-6"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={onSave}>Сохранить легенду</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
