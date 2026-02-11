// app/home/page.tsx
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Home...</div>}>
      <HomeClient />
    </Suspense>
  );
}
