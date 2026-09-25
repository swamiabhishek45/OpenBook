import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  size?: number;
};

export const INTEGRATION_LOGO_PATHS = {
  googleDrive: "/integrations/google-drive-logo.png",
  notion: "/integrations/notion-logo.webp",
  notionWhite: "/integrations/notion-logo-white.webp",
} as const;

export function GoogleDriveIcon({ className, size = 28 }: IconProps) {
  return (
    <img
      src={INTEGRATION_LOGO_PATHS.googleDrive}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      draggable={false}
    />
  );
}

export function NotionIcon({ className, size = 22 }: IconProps) {
  const imgClass = cn("shrink-0 object-contain", className);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={INTEGRATION_LOGO_PATHS.notion}
        alt=""
        width={size}
        height={size}
        className={cn(imgClass, "dark:hidden")}
        draggable={false}
      />
      <img
        src={INTEGRATION_LOGO_PATHS.notionWhite}
        alt=""
        width={size}
        height={size}
        className={cn(imgClass, "hidden dark:block")}
        draggable={false}
      />
    </span>
  );
}
