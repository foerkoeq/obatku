// Authentication request interface
export interface AuthRequest {
  user?: {
    id: string;
    role: string;
    nip: string;
  };
  [key: string]: any;
}

// Extended request interface with pagination
export interface PaginatedRequest {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    [key: string]: any;
  };
  user?: {
    id: string;
    role: string;
    nip: string;
  };
  [key: string]: any;
}
