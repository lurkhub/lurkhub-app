'use client';

import LoadingMessage from "@/components/common/LoadingMessage";
import Start from "@/components/common/Start";
import Welcome from "@/components/common/Welcome";
import { fetchUser } from "@/services/userService";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingMessage text="Loading..." />
  }

  return (
    <div>
      {user ? <Start /> : <Welcome />}
    </div>
  );
}
