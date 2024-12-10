import { useState } from 'react';

interface User {
  id: string;
  username: string;
  totalSamples: number;
  completedSamples: number;
}

export default function useUserModel() {
  const [user, setUser] = useState<User | null>(null);

  return {
    user,
    setUser,
  };
}