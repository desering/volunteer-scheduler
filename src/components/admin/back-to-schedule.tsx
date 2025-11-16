import { SquareArrowOutUpLeft } from "lucide-react";
import Link from "next/link";
import { css, cx } from "styled-system/css";

export const BackToSchedule = () => (
  <div
    className={css({
      marginBlockEnd: "10",
      width: "full",
    })}
  >
    <Link
      href="/"
      className={cx(
        "nav__link",
        css({
          display: "flex",
          gap: "1",
          alignItems: "center",
        }),
      )}
    >
      <SquareArrowOutUpLeft size="1rem" />
      <span className="nav__link-label">Back to Schedule</span>
    </Link>
  </div>
);
