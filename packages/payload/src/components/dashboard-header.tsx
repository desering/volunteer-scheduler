import type { User } from "@payload-types";
import type { ServerProps } from "payload";

export const DashboardHeader = (props: ServerProps) => (
  <header className="dashboard-header">
    <h1>Hi {(props.user as User | undefined)?.preferredName}!</h1>
  </header>
);
