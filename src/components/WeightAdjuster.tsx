'use client';

import { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addWeight, updateWeight } from '../redux/slices/weightSlice';
import { Button } from './ui/Button';
import { adjustWeight } from '../lib/utils';

interface WeightAdjusterProps {
  exerciseId: string;
  initialWeight?: number;
  onWeightSaved?: () => void;
}

export function WeightAdjuster({ 
  exerciseId, 
  initialWeight = 0,
  onWeightSaved
}: WeightAdjusterProps) {
  const dispatch = useAppDispatch();
  const [currentWeight, setCurrentWeight] = useState(initialWeight);
  const [hasChangedWeight, setHasChangedWeight] = useState(false);
  
  // Get weight history for this exercise
  const weightHistory = useAppSelector((state) => 
    state.weights.weightHistory.find(item => item.exerciseId === exerciseId)?.weights || []
  );

  // Update component if initialWeight changes from parent
  useEffect(() => {
    if (initialWeight !== undefined) {
      setCurrentWeight(initialWeight);
      setHasChangedWeight(false);
    }
  }, [initialWeight]);

  const handleIncrement = () => {
    setCurrentWeight(prev => adjustWeight(prev, true));
    setHasChangedWeight(true);
  };

  const handleDecrement = () => {
    setCurrentWeight(prev => adjustWeight(prev, false));
    setHasChangedWeight(true);
  };

  const handleSaveWeight = () => {
    // Always create a new record when the user explicitly saves
    dispatch(addWeight({
      exerciseId,
      amount: currentWeight
    }));
    
    setHasChangedWeight(false);
    
    if (onWeightSaved) {
      onWeightSaved();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Disminuir peso"
          onClick={handleDecrement}
          className="h-10 w-10 rounded-full"
        >
          <FaChevronDown className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">{currentWeight}</span>
          <span className="text-sm text-gray-500">kg</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          aria-label="Aumentar peso"
          onClick={handleIncrement}
          className="h-10 w-10 rounded-full"
        >
          <FaChevronUp className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        className="w-full"
        onClick={handleSaveWeight}
      >
        Guardar Peso
      </Button>
    </div>
  );
} 