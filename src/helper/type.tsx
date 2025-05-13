// src/helper/type.ts

export interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    rate: number; // Ensure the rate property is included
  }
  
  export interface Project {
    id: string;
    name: string;
  }


  export interface PayrollItem {
    id: number;
    projectId: string;
    project: string;
    name: string;
    date_start: string;
    date_end: string;
    salary: string;
  }