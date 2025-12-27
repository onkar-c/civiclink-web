// civiclink-web/features/issues/types.ts

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type Issue = {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type CreateIssuePayload = {
  title: string;
  description: string;
  priority: IssuePriority;
  latitude: number;
  longitude: number;
};

export type UpdateIssuePayload = {
  title?: string;
  description?: string;
  priority?: IssuePriority;
  latitude?: number;
  longitude?: number;
};
