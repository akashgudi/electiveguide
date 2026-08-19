import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function setReviewSubmissionEnabled(enabled: boolean) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { reviewSubmissionEnabled: enabled },
    create: { id: SETTINGS_ID, reviewSubmissionEnabled: enabled },
  });
}
