// src/pages/manager/CreateCoursePage.tsx
import React from 'react';
import CreateCourseForm from '../../components/manager/forms/CreateCourseForm';

interface CreateCoursePageProps {
  onBack?: () => void;
  onSave?: (data: any) => void;
}

export default function CreateCoursePage({ onBack, onSave }: CreateCoursePageProps) {
  return (
    <CreateCourseForm
      onBack={onBack || (() => { window.history.back(); })}
      onSave={onSave}
    />
  );
}
