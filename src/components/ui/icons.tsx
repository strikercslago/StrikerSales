import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;
const Icon = ({ children, ...props }: Props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;

export const UploadIcon = (p: Props) => <Icon {...p}><path d="M12 16V3m0 0L7 8m5-5 5 5M4 15v5h16v-5" /></Icon>;
export const SearchIcon = (p: Props) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
export const PhoneIcon = (p: Props) => <Icon {...p}><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2c-3.6-1.5-6.5-4.4-8-8l2-2-2-4Z" /></Icon>;
export const CloseIcon = (p: Props) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const ArrowIcon = (p: Props) => <Icon {...p}><path d="M5 12h14m-5-5 5 5-5 5" /></Icon>;
export const MapIcon = (p: Props) => <Icon {...p}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></Icon>;
export const MoreIcon = (p: Props) => <Icon {...p}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></Icon>;
export const BackupIcon = (p: Props) => <Icon {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></Icon>;
export const LeadsIcon = (p: Props) => <Icon {...p}><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" /></Icon>;
export const ProjectsIcon = (p: Props) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 5V3h8v2M3 11h18M10 11v3h4v-3" /></Icon>;
