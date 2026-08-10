import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLogoAssets } from "@/lib/has-logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const logoAssets = getLogoAssets();

  return (
    <>
      <SiteHeader logoAssets={logoAssets} />
      <main className="flex-1">{children}</main>
      <SiteFooter logoAssets={logoAssets} />
    </>
  );
}
