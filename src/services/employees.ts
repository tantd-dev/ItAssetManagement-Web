import { api } from "@/lib/api";
import type {
  AssignmentItem,
  Employee,
  EmployeeDepartmentHistory,
} from "@/types";
import { createCrud } from "./crud";

export interface EmployeeInput {
  employeeCode: string;
  fullName: string;
  departmentId?: string | null;
  email?: string;
  status?: string;
}

export const employeeService = {
  ...createCrud<Employee, EmployeeInput>("/employees"),
  currentAssets: (id: string) =>
    api.get<AssignmentItem[]>(`/employees/${id}/assets`),
  departmentHistory: (id: string) =>
    api.get<EmployeeDepartmentHistory[]>(`/employees/${id}/department-history`),
};
