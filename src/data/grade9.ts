import { ReadingLesson } from '../types';
import { GRADE_9_LESSONS_PART1 } from './grade9_part1';
import { GRADE_9_LESSONS_PART2 } from './grade9_part2';

export const GRADE_9_LESSONS: ReadingLesson[] = [
  ...GRADE_9_LESSONS_PART1,
  ...GRADE_9_LESSONS_PART2
];
