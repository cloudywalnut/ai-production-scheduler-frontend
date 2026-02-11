// app/home/page.tsx
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        Loading Home...
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
