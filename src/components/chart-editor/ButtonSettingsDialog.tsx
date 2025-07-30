import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartButton } from "@/components/Chart";
import { Folder, Range } from "@/contexts/RangeContext";

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#6b7280'];

interface ButtonSettingsDialogProps {
  isMobileMode: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  onCopy: () => void;
  editingButton: ChartButton | null;
  setEditingButton: React.Dispatch<React.SetStateAction<ChartButton | null>>;
  folders: Folder[];
  selectedFolderIdForModal: string | null;
  setSelectedFolderIdForModal: React.Dispatch<React.SetStateAction<string | null>>;
  rangesForSelectedFolder: Range[];
  onOpenLegendPreview: () => void;
}

export const ButtonSettingsDialog = ({
  isMobileMode,
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  onCopy,
  editingButton,
  setEditingButton,
  folders,
  selectedFolderIdForModal,
  setSelectedFolderIdForModal,
  rangesForSelectedFolder,
  onOpenLegendPreview,
}: ButtonSettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onCancel();
      else onOpenChange(true);
    }}>
      <DialogContent mobileFullscreen={isMobileMode}>
        <DialogHeader>
          <DialogTitle>Настройка кнопки</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buttonName" className="text-right">
              Название
            </Label>
            <Input
              id="buttonName"
              value={editingButton?.name || ""}
              onChange={(e) => setEditingButton(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="col-span-3 h-6"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Цвет</Label>
            <div className="col-span-3 flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    editingButton?.color === preset ? 'border-ring' : 'border-transparent'
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => setEditingButton(prev => prev ? { ...prev, color: preset } : null)}
                />
              ))}
              <label className="w-6 h-6 rounded-full border-2 cursor-pointer" style={{ backgroundColor: editingButton?.color }}>
                <Input
                  type="color"
                  value={editingButton?.color || "#000000"}
                  onChange={(e) => setEditingButton(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-0 h-0 opacity-0"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Тип</Label>
            <RadioGroup
              value={editingButton?.type === 'normal' ? 'normal' : 'label'}
              onValueChange={(type) => {
                setEditingButton(prev => {
                  if (!prev) return null;
                  if (type === 'label') {
                    setSelectedFolderIdForModal(null);
                    return { ...prev, type: 'label', linkedItem: 'label-only' };
                  } else {
                    const firstFolder = folders[0];
                    setSelectedFolderIdForModal(firstFolder?.id || null);
                    return { ...prev, type: 'normal', linkedItem: firstFolder?.ranges[0]?.id || '' };
                  }
                });
              }}
              className="col-span-3 flex gap-4"
              disabled={editingButton?.type === 'exit'}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="type-normal" />
                <Label htmlFor="type-normal" className="font-normal">Диапазон</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="label" id="type-label" />
                <Label htmlFor="type-label" className="font-normal">Текст</Label>
              </div>
            </RadioGroup>
          </div>

          {editingButton?.type === 'normal' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Привязать</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Select
                  value={selectedFolderIdForModal || ''}
                  onValueChange={(folderId) => {
                    setSelectedFolderIdForModal(folderId);
                    const folder = folders.find(f => f.id === folderId);
                    const firstRangeId = folder?.ranges[0]?.id || '';
                    setEditingButton(prev => prev ? { ...prev, linkedItem: firstRangeId } : null);
                  }}
                >
                  <SelectTrigger className="h-6">
                    <SelectValue placeholder="Папка..." />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={editingButton.linkedItem || ''}
                  onValueChange={(rangeId) => {
                    setEditingButton(prev => prev ? { ...prev, linkedItem: rangeId } : null);
                  }}
                  disabled={!selectedFolderIdForModal}
                >
                  <SelectTrigger className="h-6">
                    <SelectValue placeholder="Диапазон..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rangesForSelectedFolder.map(range => (
                      <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
            <Label className="text-right">Шрифт</Label>
            <div className="col-span-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adaptiveFont"
                  checked={editingButton?.isFontAdaptive ?? true}
                  onCheckedChange={(checked) => {
                    setEditingButton(prev => prev ? { ...prev, isFontAdaptive: !!checked } : null);
                  }}
                />
                <Label htmlFor="adaptiveFont" className="font-normal">Адаптивный</Label>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  id="fontSize"
                  type="number"
                  value={editingButton?.fontSize || 16}
                  onChange={(e) => setEditingButton(prev => prev ? { ...prev, fontSize: parseInt(e.target.value) || 16 } : null)}
                  className="w-16 h-6"
                  min="1"
                  disabled={editingButton?.isFontAdaptive ?? true}
                />
                <Label htmlFor="fontSize" className="font-normal text-sm text-muted-foreground">px</Label>
              </div>

              <RadioGroup
                value={editingButton?.fontColor || 'white'}
                onValueChange={(value: 'white' | 'black') => {
                  setEditingButton(prev => prev ? { ...prev, fontColor: value } : null);
                }}
                className="flex gap-4"
                disabled={editingButton?.isFontAdaptive ?? true}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="fontWhite" />
                  <Label htmlFor="fontWhite" className="font-normal">Белый</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="fontBlack" />
                  <Label htmlFor="fontBlack" className="font-normal">Черный</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
            <Label htmlFor="buttonWidth" className="text-right">
              Ширина
            </Label>
            <Input
              id="buttonWidth"
              type="number"
              value={editingButton?.width || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setEditingButton(prev => prev ? { ...prev, width: isNaN(value) ? 0 : value } : null);
              }}
              className="col-span-3 h-6"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buttonHeight" className="text-right">
              Высота
            </Label>
            <Input
              id="buttonHeight"
              type="number"
              value={editingButton?.height || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setEditingButton(prev => prev ? { ...prev, height: isNaN(value) ? 0 : value } : null);
              }}
              className="col-span-3 h-6"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
            <Label className="text-right col-start-1">Опции</Label>
            <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                    id="showLegend"
                    checked={editingButton?.showLegend ?? false}
                    onCheckedChange={(checked) => {
                        setEditingButton(prev => prev ? { ...prev, showLegend: !!checked } : null);
                    }}
                    disabled={editingButton?.type === 'label' || editingButton?.type === 'exit'}
                />
                <Label htmlFor="showLegend" className="font-normal">
                    Показать легенду
                </Label>
                {editingButton?.showLegend && editingButton?.type === 'normal' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 ml-2"
                    onClick={onOpenLegendPreview}
                  >
                    Предпросмотр
                  </Button>
                )}
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Отмена</Button>
          <Button variant="secondary" onClick={onCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Копировать
          </Button>
          <Button onClick={onSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
