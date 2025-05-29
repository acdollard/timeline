export type EventType = 'birth' | 'school' | 'travel' | 'relationships' | 'move' | 'career' | 'pets' | 'bucket-list' | 'hobbies' | string;

export const getPinColor = (type: EventType): string => {
  switch (type) {
    case 'birth':
      return 'bg-white';
    case 'school':
      return 'bg-gradient-to-r from-blue-500 to-blue-700 ';
    case 'travel':
      return 'bg-gradient-to-r from-red-500 to-red-700';
    case 'relationships':
      return 'bg-gradient-to-r from-pink-500 to-pink-700';
    case 'move':
      return 'bg-gradient-to-r from-purple-500 to-purple-700';
    case 'career':
      return 'bg-gradient-to-r from-green-500 to-green-700';
    case 'pets':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
    case 'bucket-list':
      return 'bg-gradient-to-r from-orange-500 to-orange-700';
    case 'hobbies':
      return 'bg-gradient-to-r from-teal-500 to-teal-700';
    default:
      return 'bg-gray-500';
  }
}; 