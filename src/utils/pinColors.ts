export type EventType = 'birth' | 'school' | 'travel' | 'relationships' | 'move' | 'career' | 'pets' | 'bucket-list' | 'hobbies' | string;

export const getPinColor = (type: EventType): string => {
  switch (type) {
    case 'birth':
      return 'bg-white';
    case 'school':
      return 'bg-blue-500';
    case 'travel':
      return 'bg-red-500';
    case 'relationships':
      return 'bg-pink-500';
    case 'move':
      return 'bg-purple-500';
    case 'career':
      return 'bg-green-500';
    case 'pets':
      return 'bg-yellow-500';
    case 'bucket-list':
      return 'bg-orange-500';
    case 'hobbies':
      return 'bg-teal-500';
    default:
      return 'bg-gray-500';
  }
}; 