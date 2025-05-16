'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Weekday } from '@/generated/prisma';

export default function AddDayPage({ params }: { params: { routineId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday | ''>('');
  const [routineLoading, setRoutineLoading] = useState(true);
  const [existingDays, setExistingDays] = useState<string[]>([]);

  const weekdays = [
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY,
    Weekday.SUNDAY
  ];

  // Fetch routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await api.get(`/routines/${params.routineId}`);
        setRoutine(response.data);
        
        // Get existing days
        const daysResponse = await api.get(`/routines/${params.routineId}/days`);
        setExistingDays(daysResponse.data.map((day: any) => day.weekday));
      } catch (error) {
        console.error('Error fetching routine:', error);
        setError('Failed to load routine data');
      } finally {
        setRoutineLoading(false);
      }
    };

    fetchRoutine();
  }, [params.routineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWeekday) {
      setError('Please select a weekday');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/routines/${params.routineId}/days`, {
        weekday: selectedWeekday
      });
      
      router.push(`/routines/${params.routineId}`);
    } catch (error: any) {
      console.error('Error adding day:', error);
      setError(error.response?.data?.error || 'Failed to add day');
    } finally {
      setLoading(false);
    }
  };

  if (routineLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p>Loading routine data...</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load routine data</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/routines" className="text-blue-600 hover:text-blue-700">
              Back to Routines
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Workout Day</CardTitle>
          <CardDescription>
            Add a new day to "{routine.name}" routine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Weekday
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedWeekday}
                onChange={(e) => setSelectedWeekday(e.target.value as Weekday)}
                disabled={loading}
              >
                <option value="">Select a day</option>
                {weekdays.map((day) => (
                  <option 
                    key={day} 
                    value={day}
                    disabled={existingDays.includes(day)}
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()} {existingDays.includes(day) ? '(Already added)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Link 
                href={`/routines/${params.routineId}`}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={loading || !selectedWeekday}
              >
                {loading ? 'Adding...' : 'Add Day'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 