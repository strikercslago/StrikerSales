import "./project-system.css";
import "./adaptive-workspace.css";
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout";

export default function ProtectedRoutesLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
