import RootDocument, { metadata } from "../root-document";
export { metadata };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument language="fr">{children}</RootDocument>;
}
