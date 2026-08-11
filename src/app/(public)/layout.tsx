import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLogoAssets } from "@/lib/has-logo";
import { getSiteContent } from "@/lib/data/site-content";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const logoAssets = getLogoAssets();
  const content = await getSiteContent();

  return (
    <>
      <SiteHeader logoAssets={logoAssets} />
      <main className="flex-1">{children}</main>
      <SiteFooter logoAssets={logoAssets} content={content} />
    </>
  );
}
