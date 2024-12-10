import { useState } from 'react';

interface User {
  id: string;
  username: string;
  total_samples: number;
  completed_samples: number;
}

export default function useUserModel() {
  const [user, setUser] = useState<User | null>(null);

  return {
    user,
    setUser,
  };
}