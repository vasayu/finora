import Navbar from "@/Components/Navbar";
import SmoothScroll from "@/Components/SmoothScroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Navbar />
      {children}
    </SmoothScroll>
  );
}
