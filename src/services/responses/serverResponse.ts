import UserResponse from '@/services/responses/userResponse'

export interface ServerResponse {
  id: number;
  name: string;
  description: string;
  ipAddress: number;
  port: number;
  imageUrl: string;
  owner: UserResponse;
}
