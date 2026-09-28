import { useEffect, useState } from "react";
import { getProfile, subscribeProfile, type Profile } from "@/lib/profile";

export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>(getProfile);

  useEffect(() => {
    setProfile(getProfile());
    return subscribeProfile(() => setProfile(getProfile()));
  }, []);

  return profile;
}
