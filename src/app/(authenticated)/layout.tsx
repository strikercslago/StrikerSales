import "./project-system.css";
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout";

export default function ProtectedRoutesLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
