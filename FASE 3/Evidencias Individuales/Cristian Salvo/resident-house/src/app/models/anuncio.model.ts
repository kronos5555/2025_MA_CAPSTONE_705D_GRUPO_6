export interface Anuncio {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorRole: 'resident' | 'conserje';
  createdAt: Date;
  updatedAt: Date;
  category?: 'lost' | 'found' | 'event' | 'announcement' | 'other';
}