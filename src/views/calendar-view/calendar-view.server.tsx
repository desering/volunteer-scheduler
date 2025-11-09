import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewProps, CollectionSlug } from "payload";
import { ClientProviders } from "@/app/(scheduler)/client-providers";
import { CalendarViewClient } from "./calendar-view.client";

const supportedSlugs: CollectionSlug[] = ["events"];

export const CalendarView = async ({
  params,
  initPageResult,
  searchParams,
}: AdminViewProps) => {
  let collectionSlug: CollectionSlug | undefined;

  if (typeof params?.segments === "object") {
    const potentialSlug = params.segments[1] as CollectionSlug;

    if (supportedSlugs.includes(potentialSlug)) {
      collectionSlug = potentialSlug;
    }
  }

  if (!collectionSlug) {
    throw new Error("Unsupported collection slug");
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <ClientProviders>
        <CalendarViewClient />
      </ClientProviders>
    </DefaultTemplate>
  );
};
