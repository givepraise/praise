import { formatDate } from '@/utils/date';
import { useOutsideAlerter } from '@/utils/index';
import React from 'react';
import DayPicker from 'react-day-picker';
import { useField, useForm } from 'react-final-form';

export const PeriodDayPicker = () => {
  const form = useForm();

  // Subscribe to the "active" event on the endDate input
  const {
    meta: { active },
  } = useField('endDate', {
    subscription: { active: true },
  });

  // Determines if popup is visible, toggles between "visible" and "hidden"
  const [visibilityClass, setVisibilityClass] =
    React.useState<string>('hidden');

  // Detect clicks outside of day picker
  const wrapperRef = React.useRef(null);
  const { timestamp } = useOutsideAlerter(wrapperRef);

  // Show day picker when input becomes active
  React.useEffect(() => {
    if (active) {
      setVisibilityClass('visible');
    }
  }, [active]);

  // Close day picker when outside click detected
  React.useEffect(() => {
    setVisibilityClass('hidden');
  }, [timestamp]);

  const handleDayClick = (day: any) => {
    form.mutators.setDate(formatDate(day));
    setVisibilityClass('hidden');
  };

  return (
    <div
      className={`absolute mt-1 p-2 border text-xs rounded-lg shadow-lg bg-gray-50 ${visibilityClass}`}
      ref={wrapperRef}
    >
      <DayPicker onDayClick={handleDayClick} />
    </div>
  );
};
