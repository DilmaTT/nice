import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartControlsProps {
  isMobileMode: boolean;
  onAddButton: () => void;
  onMaximizeCanvas: () => void;
  canvasWidth: number;
  onDimensionChange: (value: string, setter: React.Dispatch<React.SetStateAction<number>>) => void;
  setCanvasWidth: React.Dispatch<React.SetStateAction<number>>;
  onDimensionBlur: (value: number, setter: React.Dispatch<React.SetStateAction<number>>) => void;
  canvasHeight: number;
  setCanvasHeight: React.Dispatch<React.SetStateAction<number>>;
}

export const ChartControls = ({
  isMobileMode,
  onAddButton,
  onMaximizeCanvas,
  canvasWidth,
  onDimensionChange,
  setCanvasWidth,
  onDimensionBlur,
  canvasHeight,
  setCanvasHeight,
}: ChartControlsProps) => {
  return (
    <div className={cn(
      "flex flex-col",
      isMobileMode ? "p-4 mb-2 gap-2" : "mb-6 gap-4"
    )}>
      <div className={cn(
        "flex items-center",
        isMobileMode ? "gap-2" : "gap-4"
      )}>
        <Button onClick={onAddButton} className="flex items-center gap-2 h-7">
          <Plus className="h-4 w-4" />
          Добавить кнопку
        </Button>
        <Button variant="ghost" size="icon" onClick={onMaximizeCanvas} title="Развернуть на весь экран">
          <Expand className="h-5 w-5" />
        </Button>
      </div>
      
      <div className={cn(
        "flex items-center gap-1 flex-wrap",
        isMobileMode ? "grid grid-cols-[auto_1fr] gap-x-1 gap-y-1 w-full" : ""
      )}>
        <Label htmlFor="canvasWidth" className={cn("text-right", isMobileMode && "text-left")}>
          Ширина
        </Label>
        <Input
          id="canvasWidth"
          type="number"
          value={isNaN(canvasWidth) ? '' : canvasWidth}
          onChange={(e) => onDimensionChange(e.target.value, setCanvasWidth)}
          onBlur={() => onDimensionBlur(canvasWidth, setCanvasWidth)}
          className="w-20 h-7"
          min="100"
          maxLength={4}
        />
        <Label htmlFor="canvasHeight" className={cn("text-right", isMobileMode && "text-left")}>
          Высота
        </Label>
        <Input
          id="canvasHeight"
          type="number"
          value={isNaN(canvasHeight) ? '' : canvasHeight}
          onChange={(e) => onDimensionChange(e.target.value, setCanvasHeight)}
          onBlur={() => onDimensionBlur(canvasHeight, setCanvasHeight)}
          className="w-20 h-7"
          min="100"
          maxLength={4}
        />
      </div>
    </div>
  );
};
