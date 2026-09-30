import { ReadingLesson } from '../types';
import { GRADE_8_LESSONS_PART1 } from './grade8_part1';
import { GRADE_8_LESSONS_PART2 } from './grade8_part2';

export const GRADE_8_LESSONS: ReadingLesson[] = [
  ...GRADE_8_LESSONS_PART1,
  ...GRADE_8_LESSONS_PART2
];
