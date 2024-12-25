import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewProps, CollectionSlug } from "payload";
import { CalenderViewClient } from "./calender-view.client";
import Providers from "@/app/providers";

const supportedSlugs: CollectionSlug[] = ["shifts"];

export const CalenderView = async ({
  params,
  initPageResult,
  searchParams,
}: AdminViewProps) => {
  let collectionSlug: CollectionSlug | undefined = undefined;

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
      <Providers>
        <CalenderViewClient />
      </Providers>
    </DefaultTemplate>
  );
};
