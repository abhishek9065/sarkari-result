export * from './types/index';

// Define 'r' as a type alias to Result 
// This fixes the compilation error in api.ts where 'r' is used instead of 'Result'
import { Result } from './types/index';
export type r = Result;
