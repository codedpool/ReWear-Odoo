import { ClothingItem, SwapRequest, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    points: 100,
    joinedDate: '2025-01-01',
    location: 'New York, NY'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    points: 150,
    joinedDate: '2025-02-01',
    location: 'Los Angeles, CA'
  }
];

export const mockItems: ClothingItem[] = [
  {
    id: '1',
    title: 'Blue Denim Jacket',
    description: 'A stylish blue denim jacket in great condition.',
    category: 'outerwear',
    type: 'Jacket',
    size: 'M',
    condition: 'like-new',
    tags: ['casual', 'denim', 'blue'],
    images: ['/images/denim-jacket.jpg'],
    uploaderId: '1',
    uploaderName: 'John Doe',
    uploaderAvatar: '/images/john-avatar.jpg',
    pointValue: 50,
    isAvailable: true,
    uploadDate: '2025-07-01',
    location: 'New York, NY'
  },
  {
    id: '2',
    title: 'Red Summer Dress',
    description: 'Vibrant red dress, perfect for summer outings.',
    category: 'dresses',
    type: 'Dress',
    size: 'S',
    condition: 'new',
    tags: ['summer', 'red', 'casual'],
    images: ['/images/red-dress.jpg'],
    uploaderId: '2',
    uploaderName: 'Jane Smith',
    uploaderAvatar: '/images/jane-avatar.jpg',
    pointValue: 70,
    isAvailable: true,
    uploadDate: '2025-07-05',
    location: 'Los Angeles, CA'
  }
];

export const mockSwapRequests: SwapRequest[] = [
  {
    id: '1',
    requesterId: '2',
    requesterName: 'Jane Smith',
    itemId: '1',
    itemTitle: 'Blue Denim Jacket',
    offeredItemId: '2',
    offeredItemTitle: 'Red Summer Dress',
    type: 'swap',
    status: 'pending',
    createdDate: '2025-07-10',
    message: 'Interested in swapping for your jacket!'
  }
];