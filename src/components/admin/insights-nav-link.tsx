import { ChartColumnIcon } from "lucide-react";
import Link from "next/link";
import { css, cx } from "styled-system/css";

/** Sidebar link to /admin/insights, styled like the "Back to Schedule" link. */
export const InsightsNavLink = () => (
  <div className={css({ marginBlockStart: "6", width: "full" })}>
    <Link
      href="/admin/insights"
      className={cx(
        "nav__link",
        css({ display: "flex", gap: "1", alignItems: "center" }),
      )}
    >
      <ChartColumnIcon size="1rem" />
      <span className="nav__link-label">Volunteer insights</span>
    </Link>
  </div>
);
