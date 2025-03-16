import "@/assets/styles/globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "PropertyPulse | Find the perfect Rental",
  description: "find your dream rental property",
  keywords: "rentals, find rentals, find properties",
};

const Mainlayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
};

export default Mainlayout;
