'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchWeightHistory, deleteWeight } from '../redux/slices/weightSlice';
import { Exercise } from '../redux/slices/routineSlice';
import { WeightAdjuster } from './WeightAdjuster';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { FaTrash } from 'react-icons/fa';
import { Button } from './ui/Button';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const dispatch = useAppDispatch();
  const weightHistory = useAppSelector((state) => 
    state.weights.weightHistory.find(item => item.exerciseId === exercise.id)?.weights || []
  );
  const [deletingWeightId, setDeletingWeightId] = useState<string | null>(null);
  
  // Load the latest weight on component mount
  useEffect(() => {
    dispatch(fetchWeightHistory(exercise.id));
  }, [dispatch, exercise.id]);
  
  // Get the most recent weight
  const getLatestWeight = () => {
    if (weightHistory.length === 0) return 0;
    
    const sortedWeights = [...weightHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedWeights[0].amount;
  };

  // Format timestamps for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle weight deletion
  const handleDeleteWeight = async (weightId: string) => {
    try {
      setDeletingWeightId(weightId);
      await dispatch(deleteWeight({ exerciseId: exercise.id, weightId })).unwrap();
    } catch (error) {
      console.error('Failed to delete weight:', error);
    } finally {
      setDeletingWeightId(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Peso Actual</span>
          <span className="text-sm font-medium">
            {weightHistory.length > 0 ? 
              `${getLatestWeight()} kg` : 
              "Sin registros"}
          </span>
        </div>
        
        <WeightAdjuster 
          exerciseId={exercise.id} 
          initialWeight={getLatestWeight()}
        />
        
        {weightHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Historial de Pesos</h4>
            <div className="max-h-32 overflow-y-auto">
              {[...weightHistory]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5) // Show only the 5 most recent
                .map((weight) => (
                  <div 
                    key={weight.id} 
                    className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100"
                  >
                    <span className="text-gray-600">{formatDate(weight.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{weight.amount} kg</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteWeight(weight.id)}
                        disabled={deletingWeightId === weight.id}
                        aria-label="Eliminar registro de peso"
                      >
                        {deletingWeightId === weight.id ? (
                          <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-red-500 animate-spin"></span>
                        ) : (
                          <FaTrash className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 