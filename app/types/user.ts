export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  lastAlbumCreationDate: Date | null;
  dailyAlbumCount: number | null;
  totalOptimizations: number | null;
  lastOptimizationReset: Date | null;
}
