import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoredChart } from "./Chart";
import { useChartEditorLogic } from "@/hooks/useChartEditorLogic";
import { ChartControls } from "./chart-editor/ChartControls";
import { ChartCanvas } from "./chart-editor/ChartCanvas";
import { ButtonSettingsDialog } from "./chart-editor/ButtonSettingsDialog";
import { LegendPreviewDialog } from "./chart-editor/LegendPreviewDialog";

interface ChartEditorProps {
  isMobileMode?: boolean;
  chart: StoredChart;
  onBackToCharts: () => void;
  onSaveChart: (updatedChart: StoredChart) => void;
}

export const ChartEditor = ({ isMobileMode = false, chart, onBackToCharts, onSaveChart }: ChartEditorProps) => {
  const {
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
  } = useChartEditorLogic(chart, isMobileMode, onBackToCharts, onSaveChart);

  const Controls = (
    <ChartControls
      isMobileMode={isMobileMode}
      onAddButton={handleAddButton}
      onMaximizeCanvas={handleMaximizeCanvas}
      canvasWidth={canvasWidth}
      onDimensionChange={handleDimensionChange}
      setCanvasWidth={setCanvasWidth}
      onDimensionBlur={handleDimensionBlur}
      canvasHeight={canvasHeight}
      setCanvasHeight={setCanvasHeight}
    />
  );

  const Canvas = (
    <ChartCanvas
      canvasRef={canvasRef}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      buttons={buttons}
      activeButtonId={activeButtonId}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onButtonMouseMove={handleButtonMouseMove}
      onButtonMouseLeave={handleButtonMouseLeave}
      onSettingsClick={handleSettingsClick}
    />
  );

  return (
    <div className={cn(
      "p-6",
      isMobileMode ? "flex-1 overflow-y-auto" : "min-h-screen"
    )}>
      <div className={cn(
        "mx-auto",
        isMobileMode ? "w-full" : ""
      )}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackButtonClick} title="Назад к чартам">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{chartName}</h1>
          </div>
        </div>

        {isMobileMode ? (
          <>
            {Controls}
            {Canvas}
          </>
        ) : (
          <>
            {Controls}
            {Canvas}
          </>
        )}

        <ButtonSettingsDialog
          isMobileMode={isMobileMode}
          isOpen={isButtonModalOpen}
          onOpenChange={setIsButtonModalOpen}
          onCancel={handleCancelButtonProperties}
          onSave={handleSaveButtonProperties}
          onCopy={handleCopyButton}
          editingButton={editingButton}
          setEditingButton={setEditingButton}
          folders={folders}
          selectedFolderIdForModal={selectedFolderIdForModal}
          setSelectedFolderIdForModal={setSelectedFolderIdForModal}
          rangesForSelectedFolder={rangesForSelectedFolder}
          onOpenLegendPreview={handleOpenLegendPreview}
        />

        <LegendPreviewDialog
          isOpen={isLegendPreviewOpen}
          onOpenChange={setIsLegendPreviewOpen}
          onSave={handleSaveLegendOverrides}
          linkedRangeForPreview={linkedRangeForPreview}
          actionsInPreviewedRange={actionsInPreviewedRange}
          actionButtons={actionButtons}
          tempLegendOverrides={tempLegendOverrides}
          setTempLegendOverrides={setTempLegendOverrides}
        />
      </div>
    </div>
  );
};
