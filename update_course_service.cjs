const fs = require('fs');

let content = fs.readFileSync('src/services/courseService.ts', 'utf8');

const isMockCondition = `!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')`;

const pubMock = `  try {
    if (${isMockCondition}) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const published = localCourses.filter((c: any) => c.is_published);
      return { success: true, data: published };
    }`;
content = content.replace(`export const getPublishedCourses = async (): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {\n  try {`, `export const getPublishedCourses = async (): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {\n${pubMock}`);

const manMock = `  try {
    if (${isMockCondition}) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      // Allow executive manager to see all courses (optional)
      const isExec = localStorage.getItem('test_role') === 'executive_manager';
      const managerCourses = isExec ? localCourses : localCourses.filter((c: any) => c.instructor_id === managerId);
      return { success: true, data: managerCourses };
    }`;
content = content.replace(`export const getManagerCourses = async (managerId: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {\n  try {`, `export const getManagerCourses = async (managerId: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {\n${manMock}`);

const createMock = `  try {
    if (${isMockCondition}) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const newCourse = { ...courseData, id: Date.now(), created_at: new Date().toISOString(), instructor: { full_name: 'استاد محترم', avatar_url: '' } };
      localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));
      return { success: true, data: newCourse };
    }`;
content = content.replace(`export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {\n  try {`, `export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {\n${createMock}`);

const deleteMock = `  try {
    if (${isMockCondition}) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      localStorage.setItem('mock_courses', JSON.stringify(localCourses.filter((c: any) => c.id !== courseId)));
      return { success: true };
    }`;
content = content.replace(`export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {\n  try {`, `export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {\n${deleteMock}`);

fs.writeFileSync('src/services/courseService.ts', content);
