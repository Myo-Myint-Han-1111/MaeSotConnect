export interface CreatedByUser {
  id: string;
  name: string;
  image: string | null;
  role: string;
  advocateProfile?: {
    publicName: string | null;
    avatarUrl: string | null;
    status: string;
  } | null;
}

export interface CreatorInfo {
  name: string;
  image: string | null;
  role: string;
}

/**
 * Gets display information for course creator
 */
export const getCreatorInfo = (
  createdByUser: CreatedByUser | null | undefined,
  anonymousAdvocateText: string
): CreatorInfo => {
  if (!createdByUser) {
    return {
      name: anonymousAdvocateText,
      image: "/images/AnonYouthAdvocate.png",
      role: "YOUTH_ADVOCATE",
    };
  }
  
  // For youth advocates, use their publicName from profile if available
  if (createdByUser.role === 'YOUTH_ADVOCATE' && createdByUser.advocateProfile) {
    const profile = createdByUser.advocateProfile;
    if (profile.status === 'APPROVED') {
      return {
        name: profile.publicName || anonymousAdvocateText,
        image: profile.avatarUrl || "/images/AnonYouthAdvocate.png",
        role: createdByUser.role,
      };
    }
  }
  
  // For organization admins and platform admins, use their regular profile
  return {
    name: createdByUser.name,
    image: createdByUser.image,
    role: createdByUser.role,
  };
};