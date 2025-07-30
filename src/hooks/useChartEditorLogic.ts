import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRangeContext } from "@/contexts/RangeContext";
import { StoredChart, ChartButton } from "@/components/Chart";

const MIN_CANVAS_DIMENSION = 100;
const MIN_BUTTON_DIMENSION = 5;

export const useChartEditorLogic = (
  chart: StoredChart,
  isMobileMode: boolean,
  onBackToCharts: () => void,
  onSaveChart: (updatedChart: StoredChart) => void
) => {
  const { folders, actionButtons } = useRangeContext();
  const allRanges = folders.flatMap(folder => folder.ranges);

  const [chartName, setChartName] = useState(chart.name);
  const [buttons, setButtons] = useState<ChartButton[]>(chart.buttons);
  const [canvasWidth, setCanvasWidth] = useState(chart.canvasWidth || 800);
  const [canvasHeight, setCanvasHeight] = useState(chart.canvasHeight || 500);
  const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<ChartButton | null>(null);
  const [isLegendPreviewOpen, setIsLegendPreviewOpen] = useState(false);
  const [tempLegendOverrides, setTempLegendOverrides] = useState<Record<string, string>>({});
  
  const [selectedFolderIdForModal, setSelectedFolderIdForModal] = useState<string | null>(null);

  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChartName(chart.name);
    setButtons(chart.buttons);
    setCanvasWidth(chart.canvasWidth || 800);
    setCanvasHeight(chart.canvasHeight || 500);
  }, [chart]);

  useEffect(() => {
    if (isButtonModalOpen && editingButton) {
        const parentFolder = (editingButton.type === 'normal' && editingButton.linkedItem)
            ? folders.find(f => f.ranges.some(r => r.id === editingButton.linkedItem))
            : null;
        setSelectedFolderIdForModal(parentFolder?.id || null);
    }
  }, [isButtonModalOpen, editingButton, folders]);

  const rangesForSelectedFolder = React.useMemo(() => {
    if (!selectedFolderIdForModal) return [];
    const folder = folders.find(f => f.id === selectedFolderIdForModal);
    return folder?.ranges || [];
  }, [selectedFolderIdForModal, folders]);

  useEffect(() => {
    setButtons(prevButtons => {
      let changed = false;
      const updatedButtons = prevButtons.map(button => {
        let newX = button.x;
        let newY = button.y;
        let newWidth = button.width;
        let newHeight = button.height;

        newWidth = Math.max(MIN_BUTTON_DIMENSION, newWidth);
        newHeight = Math.max(MIN_BUTTON_DIMENSION, newHeight);

        newX = Math.max(0, Math.min(newX, canvasWidth - newWidth));
        newY = Math.max(0, Math.min(newY, canvasHeight - newHeight));

        newWidth = Math.min(newWidth, canvasWidth - newX);
        newHeight = Math.min(newHeight, canvasHeight - newY);

        if (newX !== button.x || newY !== button.y || newWidth !== button.width || newHeight !== button.height) {
          changed = true;
          return { ...button, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        return button;
      });

      if (changed) {
        return updatedButtons;
      }
      return prevButtons;
    });
  }, [canvasWidth, canvasHeight]);

  const handleAddButton = () => {
    const newButton: ChartButton = {
      id: String(Date.now()),
      name: "New",
      color: "#60A5FA",
      linkedItem: "label-only",
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      type: 'label',
      isFontAdaptive: true,
      fontSize: 16,
      fontColor: 'white',
      showLegend: false,
      legendOverrides: {},
    };
    setButtons((prev) => [...prev, newButton]);
    setEditingButton(newButton);
    setIsButtonModalOpen(true);
  };

  const handleSettingsClick = (e: React.MouseEvent, button: ChartButton) => {
    e.stopPropagation();
    setEditingButton(button);
    setIsButtonModalOpen(true);
  };

  const handleSaveButtonProperties = () => {
    if (editingButton) {
      setButtons((prev) =>
        prev.map((btn) => (btn.id === editingButton.id ? editingButton : btn))
      );
      setIsButtonModalOpen(false);
      setEditingButton(null);
    }
  };

  const handleCancelButtonProperties = () => {
    if (editingButton && !chart.buttons.some(b => b.id === editingButton.id)) {
        setButtons(prevButtons => prevButtons.filter(b => b.id !== editingButton.id));
    }
    setIsButtonModalOpen(false);
    setEditingButton(null);
  };

  const handleCopyButton = () => {
    if (editingButton) {
      const newButton: ChartButton = {
        ...editingButton,
        id: String(Date.now()),
        x: editingButton.x + 10,
        y: editingButton.y + 10,
      };
      setButtons((prev) => [...prev, newButton]);
      setIsButtonModalOpen(false);
      setEditingButton(null);
    }
  };

  const getResizeDirection = useCallback((e: React.MouseEvent | React.TouchEvent, button: ChartButton) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const coords = (e as React.TouchEvent).touches?.[0] || (e as React.MouseEvent);
    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    const tolerance = 8;

    let direction = null;
    if (x < tolerance && y < tolerance) direction = 'nw';
    else if (x > rect.width - tolerance && y < tolerance) direction = 'ne';
    else if (x < tolerance && y > rect.height - tolerance) direction = 'sw';
    else if (x > rect.width - tolerance && y > rect.height - tolerance) direction = 'se';
    else if (x < tolerance) direction = 'w';
    else if (x > rect.width - tolerance) direction = 'e';
    else if (y < tolerance) direction = 'n';
    else if (y > rect.height - tolerance) direction = 's';
    return direction;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, button: ChartButton) => {
    if ((e.target as HTMLElement).closest('.settings-icon')) return;
    e.stopPropagation();
    setActiveButtonId(button.id);
    const direction = getResizeDirection(e, button);
    if (direction) {
      setIsResizing(true);
      setResizeDirection(direction);
    } else {
      setIsDragging(true);
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [getResizeDirection]);

  const handleTouchStart = useCallback((e: React.TouchEvent, button: ChartButton) => {
    if ((e.target as HTMLElement).closest('.settings-icon')) return;
    e.stopPropagation();
    setActiveButtonId(button.id);
    const direction = getResizeDirection(e, button);
    if (direction) {
      setIsResizing(true);
      setResizeDirection(direction);
    } else {
      setIsDragging(true);
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const touch = e.touches[0];
    setDragOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
  }, [getResizeDirection]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeButtonId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentButton = buttons.find(b => b.id === activeButtonId);
    if (!currentButton) return;

    if (isDragging) {
      let newX = e.clientX - dragOffset.x - canvasRect.left;
      let newY = e.clientY - dragOffset.y - canvasRect.top;
      newX = Math.max(0, Math.min(newX, canvasRect.width - currentButton.width));
      newY = Math.max(0, Math.min(newY, canvasRect.height - currentButton.height));
      setButtons(prev => prev.map(btn => btn.id === activeButtonId ? { ...btn, x: newX, y: newY } : btn));
    } else if (isResizing && resizeDirection) {
      let { width: newWidth, height: newHeight, x: newX, y: newY } = currentButton;
      switch (resizeDirection) {
        case 'e': newWidth = Math.max(MIN_BUTTON_DIMENSION, e.clientX - (currentButton.x + canvasRect.left)); break;
        case 's': newHeight = Math.max(MIN_BUTTON_DIMENSION, e.clientY - (currentButton.y + canvasRect.top)); break;
        case 'w': const diffX_w = e.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_w); newX = currentButton.x + diffX_w; break;
        case 'n': const diffY_n = e.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_n); newY = currentButton.y + diffY_n; break;
        case 'se': newWidth = Math.max(MIN_BUTTON_DIMENSION, e.clientX - (currentButton.x + canvasRect.left)); newHeight = Math.max(MIN_BUTTON_DIMENSION, e.clientY - (currentButton.y + canvasRect.top)); break;
        case 'sw': const diffX_sw = e.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_sw); newX = currentButton.x + diffX_sw; newHeight = Math.max(MIN_BUTTON_DIMENSION, e.clientY - (currentButton.y + canvasRect.top)); break;
        case 'ne': newWidth = Math.max(MIN_BUTTON_DIMENSION, e.clientX - (currentButton.x + canvasRect.left)); const diffY_ne = e.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_ne); newY = currentButton.y + diffY_ne; break;
        case 'nw': const diffX_nw = e.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_nw); newX = currentButton.x + diffX_nw; const diffY_nw = e.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_nw); newY = currentButton.y + diffY_nw; break;
      }
      newX = Math.max(0, Math.min(newX, canvasRect.width - newWidth));
      newY = Math.max(0, Math.min(newY, canvasRect.height - newHeight));
      newWidth = Math.min(newWidth, canvasRect.width - newX);
      newHeight = Math.min(newHeight, canvasRect.height - newY);
      setButtons(prev => prev.map(btn => btn.id === activeButtonId ? { ...btn, x: newX, y: newY, width: newWidth, height: newHeight } : btn));
    }
  }, [activeButtonId, isDragging, isResizing, dragOffset, resizeDirection, buttons]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!activeButtonId || !canvasRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentButton = buttons.find(b => b.id === activeButtonId);
    if (!currentButton) return;

    if (isDragging) {
      let newX = touch.clientX - dragOffset.x - canvasRect.left;
      let newY = touch.clientY - dragOffset.y - canvasRect.top;
      newX = Math.max(0, Math.min(newX, canvasRect.width - currentButton.width));
      newY = Math.max(0, Math.min(newY, canvasRect.height - currentButton.height));
      setButtons(prev => prev.map(btn => btn.id === activeButtonId ? { ...btn, x: newX, y: newY } : btn));
    } else if (isResizing && resizeDirection) {
      let { width: newWidth, height: newHeight, x: newX, y: newY } = currentButton;
      switch (resizeDirection) {
        case 'e': newWidth = Math.max(MIN_BUTTON_DIMENSION, touch.clientX - (currentButton.x + canvasRect.left)); break;
        case 's': newHeight = Math.max(MIN_BUTTON_DIMENSION, touch.clientY - (currentButton.y + canvasRect.top)); break;
        case 'w': const diffX_w = touch.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_w); newX = currentButton.x + diffX_w; break;
        case 'n': const diffY_n = touch.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_n); newY = currentButton.y + diffY_n; break;
        case 'se': newWidth = Math.max(MIN_BUTTON_DIMENSION, touch.clientX - (currentButton.x + canvasRect.left)); newHeight = Math.max(MIN_BUTTON_DIMENSION, touch.clientY - (currentButton.y + canvasRect.top)); break;
        case 'sw': const diffX_sw = touch.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_sw); newX = currentButton.x + diffX_sw; newHeight = Math.max(MIN_BUTTON_DIMENSION, touch.clientY - (currentButton.y + canvasRect.top)); break;
        case 'ne': newWidth = Math.max(MIN_BUTTON_DIMENSION, touch.clientX - (currentButton.x + canvasRect.left)); const diffY_ne = touch.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_ne); newY = currentButton.y + diffY_ne; break;
        case 'nw': const diffX_nw = touch.clientX - (currentButton.x + canvasRect.left); newWidth = Math.max(MIN_BUTTON_DIMENSION, currentButton.width - diffX_nw); newX = currentButton.x + diffX_nw; const diffY_nw = touch.clientY - (currentButton.y + canvasRect.top); newHeight = Math.max(MIN_BUTTON_DIMENSION, currentButton.height - diffY_nw); newY = currentButton.y + diffY_nw; break;
      }
      newX = Math.max(0, Math.min(newX, canvasRect.width - newWidth));
      newY = Math.max(0, Math.min(newY, canvasRect.height - newHeight));
      newWidth = Math.min(newWidth, canvasRect.width - newX);
      newHeight = Math.min(newHeight, canvasRect.height - newY);
      setButtons(prev => prev.map(btn => btn.id === activeButtonId ? { ...btn, x: newX, y: newY, width: newWidth, height: newHeight } : btn));
    }
  }, [activeButtonId, isDragging, isResizing, dragOffset, resizeDirection, buttons]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveButtonId(null);
    setResizeDirection(null);
  }, []);

  const handleButtonMouseMove = useCallback((e: React.MouseEvent, button: ChartButton) => {
    if (isDragging || isResizing) return;
    const direction = getResizeDirection(e, button);
    (e.currentTarget as HTMLElement).style.cursor = direction ? `${direction}-resize` : 'grab';
  }, [isDragging, isResizing, getResizeDirection]);

  const handleButtonMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isDragging || isResizing) return;
    (e.currentTarget as HTMLElement).style.cursor = 'default';
  }, [isDragging, isResizing]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleBackButtonClick = () => {
    const updatedChart: StoredChart = {
      ...chart,
      name: chartName,
      buttons: buttons,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
    };
    onSaveChart(updatedChart);
    onBackToCharts();
  };

  const handleDimensionChange = (value: string, setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(parseInt(value, 10));
  };

  const handleDimensionBlur = (currentValue: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    if (isNaN(currentValue) || currentValue < MIN_CANVAS_DIMENSION) {
      setter(MIN_CANVAS_DIMENSION);
    }
  };

  const handleMaximizeCanvas = () => {
    if (!isMobileMode) {
      setCanvasWidth(Math.round(window.innerWidth * 0.97));
      setCanvasHeight(Math.round(window.innerHeight * 0.91));
    } else {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    }
  };

  const handleOpenLegendPreview = () => {
    if (editingButton) {
      setTempLegendOverrides(editingButton.legendOverrides || {});
      setIsLegendPreviewOpen(true);
    }
  };

  const handleSaveLegendOverrides = () => {
    const cleanedOverrides: Record<string, string> = {};
    for (const key in tempLegendOverrides) {
      if (tempLegendOverrides[key] && tempLegendOverrides[key].trim() !== '') {
        cleanedOverrides[key] = tempLegendOverrides[key].trim();
      }
    }
    setEditingButton(prev => prev ? { ...prev, legendOverrides: cleanedOverrides } : null);
    setIsLegendPreviewOpen(false);
  };

  const linkedRangeForPreview = editingButton?.linkedItem ? allRanges.find(r => r.id === editingButton.linkedItem) : null;

  const actionsInPreviewedRange = React.useMemo(() => {
    if (!linkedRangeForPreview) return [];
    const usedActionIds = new Set(Object.values(linkedRangeForPreview.hands));
    return actionButtons.filter(action => usedActionIds.has(action.id));
  }, [linkedRangeForPreview, actionButtons]);

  return {
    chartName,
    buttons,
    canvasWidth, setCanvasWidth,
    canvasHeight, setCanvasHeight,
    isButtonModalOpen, setIsButtonModalOpen,
    editingButton, setEditingButton,
    isLegendPreviewOpen, setIsLegendPreviewOpen,
    tempLegendOverrides, setTempLegendOverrides,
    selectedFolderIdForModal, setSelectedFolderIdForModal,
    activeButtonId,
    canvasRef,
    folders,
    actionButtons,
    allRanges,
    rangesForSelectedFolder,
    linkedRangeForPreview,
    actionsInPreviewedRange,
    handleAddButton,
    handleSettingsClick,
    handleSaveButtonProperties,
    handleCancelButtonProperties,
    handleCopyButton,
    handleMouseDown,
    handleTouchStart,
    handleButtonMouseMove,
    handleButtonMouseLeave,
    handleBackButtonClick,
    handleDimensionChange,
    handleDimensionBlur,
    handleMaximizeCanvas,
    handleOpenLegendPreview,
    handleSaveLegendOverrides,
  };
};
