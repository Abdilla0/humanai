import { useLocation } from "react-router-dom";

import BackButton from "./BackButton";

export default function GlobalBackButton() {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/humanizer" || location.pathname === "/history" || location.pathname === "/settings") {
    return null;
  }

  return (
    <div className="fixed left-4 top-20 z-50 md:left-6">
      <BackButton />
    </div>
  );
}

