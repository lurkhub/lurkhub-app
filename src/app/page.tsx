'use client';

import LoadingMessage from "@/components/common/LoadingMessage";
import Start from "@/components/start";
import Welcome from "@/components/welcome";
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
